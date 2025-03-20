from fastapi import FastAPI
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from elasticsearch import Elasticsearch
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from langchain_google_genai import ChatGoogleGenerativeAI
import threading
import time
import json
import getpass
import os
import requests
from dotenv import load_dotenv

load_dotenv()

# Get the API key from environment variables
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY is missing. Please set it in the .env file.")

os.environ["GOOGLE_API_KEY"] = GOOGLE_API_KEY 

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter your Google AI API key: ")

app = FastAPI()

# Connect to Elasticsearch
es = Elasticsearch("https://tetra-mutual-kit.ngrok-free.app/")  
# es = Elasticsearch("https://localhost:9200")  


# Store latest processed results
latest_results = {
    "summary": None,
    "root_cause": None,
    "automation": None
}

# Track last processed log timestamp
last_processed_timestamps ={}

# Load embedding model
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Load LLM
llm_engine = ChatGoogleGenerativeAI(
    model="gemini-1.5-pro",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2
)

# Define Output Parsers
summary_response_schemas = [
    ResponseSchema(
        name="operations",
        description="List of API operations, where each entry contains an operation name, summary, and logs",
        type="list",
        items=[
            {
                "name": "operation",
                "description": "API operation name",
                "type": "string",
            },
            {
                "name": "summary",
                "description": "Brief summary of the operation",
                "type": "string",
            },
            {
                "name": "logs",
                "description": "List of log entries for the operation",
                "type": "list",
            },
        ],
    )
]

# Define response schemas for root cause analysis
root_cause_response_schemas = [
    ResponseSchema(
        name="root_causes",
        description="List of root causes, each with status",
        type="list",
        items=[
            {
                "name": "root_cause",
                "description": "Concise root cause description",
                "type": "string"
            },
            {
                "name": "evidence",
                "description": "List of relevant logs",
                "type": "list"
            },
            {
                "name": "recommendation",
                "description": "Suggested fix or action",
                "type": "string"
            },
            {
                "name": "status",
                "description": "Root cause status (resolved or unresolved)",
                "type": "string"
            }
        ]
    )
]

automation_response_schemas = [
    ResponseSchema(
        name="job",
        description="Recommended automation job name. Return 'None' if no job is required.",
        type="string"  # This ensures only one job is returned
    )
]

# Create output parsers
summary_output_parser = StructuredOutputParser.from_response_schemas(summary_response_schemas)
root_cause_output_parser = StructuredOutputParser.from_response_schemas(root_cause_response_schemas)
automation_output_parser = StructuredOutputParser.from_response_schemas(automation_response_schemas)

# Log Summarization Prompt
prompt_template_summary = PromptTemplate(
    input_variables=["context"],  
    template="""
    You are an expert at log analysis. Categorize logs into **distinct API requests/operation** and generate a structured JSON output make sure that each log entry is classified into an request/operation without leaving anything unclassified.
    
    Return JSON in the format:
    {{
        "operations": [
            {{
                "operation": "API operation name",
                "summary": "Brief summary of the operation also mention about success and failure of operation",
                "logs": ["log entry 1", "log entry 2"]
            }}
        ]
    }}

    Do NOT include any additional explanation.
    
    Logs:
    {context}
    
    {format_instructions}
    """,
    partial_variables={"format_instructions": summary_output_parser.get_format_instructions()}
)

# Root Cause Analysis Prompt
prompt_template_root_cause = PromptTemplate(
    input_variables=["context"],  
    template="""
    You are an expert in root cause analysis for API logs. Identify all root causes of errors and failures based on patterns in the logs.
    
    Return ONLY JSON in the format:
    {{
        "root_causes": [
            {{
                "root_cause": "Concise root cause description",
                "evidence": ["Relevant log 1", "Relevant log 2"],
                "recommendation": "Suggested fix or action",
                "status": "resolved or unresolved"
            }}
        ]
    }}
    
    Do NOT include any additional explanation.
    
    Logs:
    {context}
    
    {format_instructions}
    """,
    partial_variables={"format_instructions": root_cause_output_parser.get_format_instructions()}
)

automation_prompt_template = PromptTemplate(
    input_variables=["context", "error_to_job_mapping"],
    template="""
    You are an automation expert. Based on the given logs, determine if an automation job is needed.
    
    Logs:
    {context}

    Use the following mapping to decide:
    {{
        "Crash": "ApplicationRestart",
        "Memory Leak": "ScaleUp",
        "Database Connection Error": "DBRestart"
    }}

    Return **ONLY ONE** job name from the mapping if applicable. If no job is needed, return `"None"`.

    Output format:
    ```json
    {{
        "job": "JobName or None"
    }}
    ```
    Do NOT include any explanation or additional text.
    
    {format_instructions}
    """,
    partial_variables={"format_instructions": automation_output_parser.get_format_instructions()}
)


def fetch_new_logs(index_name):
    global last_processed_timestamps

    query = {"size": 1000, "query": {"match_all": {}}}

    response = es.search(index=index_name, body=query)

    logs = []
    for hit in response["hits"]["hits"]:
        logs.append(Document(page_content=hit["_source"]["message"], metadata={"timestamp": hit["_source"]["@timestamp"]}))

    # Update last processed timestamp
    if logs:
        last_processed_timestamps[index_name] = logs[-1].metadata["timestamp"]

    return logs

# Background process function per index
def process_logs(index_name):
    global latest_results

    while True:
        logs_docs = fetch_new_logs(index_name)

        if not logs_docs:
            print(f"No new logs for {index_name}.")
            time.sleep(180)  # Wait 3 minutes before checking again
            continue

        # Create FAISS retriever
        vectorstore = FAISS.from_documents(logs_docs, embedding=embedding_model)
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": len(logs_docs)})

        # Create Retrieval Chains
        qa_chain_summary = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template_summary)
        qa_chain_root_cause = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template_root_cause)
        qa_chain_automation = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=automation_prompt_template)

        # Run all operations and update results per index
        latest_results[index_name] = {
            "summary": summary_output_parser.parse(qa_chain_summary.invoke({"query": "Summarize logs"})["result"]),
            "root_cause": root_cause_output_parser.parse(qa_chain_root_cause.invoke({"query": "Find root cause"})["result"]),
            "automation": automation_output_parser.parse(qa_chain_automation.invoke({"query": "Determine automation job"})["result"]),
        }

        print(f"Updated Results for {index_name}:", latest_results[index_name])

        time.sleep(180)  # Fetch logs every 3 minutes to stay within Gemini free tier

# Function to fetch indices from API and start threads
def initialize_log_processing():
    try:
        response = requests.get("https://logboard-1.onrender.com/project/getProject")
        if response.status_code == 200:
            projects = response.json()
            for project in projects:
                index_name = project.get("filebeat_index")
                if index_name:
                    if index_name not in latest_results:
                        latest_results[index_name] = {"summary": None, "root_cause": None, "automation": None}
                        threading.Thread(target=process_logs, args=(index_name,), daemon=True).start()
                        print(f"Started processing for {index_name}")
    except Exception as e:
        print(f"Failed to fetch indices: {e}")

# Start log processing
initialize_log_processing()

# API Endpoints
@app.get("/summary/{index_name}")
def get_summary(index_name: str):
    return latest_results.get(index_name, {"error": "Index not found"})["summary"]

@app.get("/root_cause/{index_name}")
def get_root_cause(index_name: str):
    return latest_results.get(index_name, {"error": "Index not found"})["root_cause"]

@app.get("/automation/{index_name}")
def get_automation(index_name: str):
    return latest_results.get(index_name, {"error": "Index not found"})["automation"]
