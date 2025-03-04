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

if "GOOGLE_API_KEY" not in os.environ:
    os.environ["GOOGLE_API_KEY"] = getpass.getpass("Enter your Google AI API key: ")

app = FastAPI()

# Connect to Elasticsearch
es = Elasticsearch("http://localhost:9200")

# Store latest processed results
latest_results = {
    "summary": None,
    "root_cause": None,
    "automation": None
}

# Track last processed log timestamp
last_processed_timestamp = None

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
    ResponseSchema(name="root_cause", description="Concise root cause description", type="string"),
    ResponseSchema(name="evidence", description="List of relevant logs", type="list"),
    ResponseSchema(name="recommendation", description="Suggested fix or action", type="string")
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
    You are an expert at log analysis. Categorize logs into **distinct API operations** and generate a structured JSON output make sure that each log entry is classified into an operation without leaving anything unclassified.
    
    Return JSON in the format:
    {{
        "operations": [
            {{
                "operation": "API operation name",
                "summary": "Brief summary of the operation",
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
    You are an expert in root cause analysis for API logs. Identify the root cause of errors and failures based on patterns in the logs.
    
    Return ONLY JSON in the format:
    {{
        "root_cause": "Concise root cause description",
        "evidence": ["Relevant log 1", "Relevant log 2"],
        "recommendation": "Suggested fix or action"
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
        "Crash": "RestartServer",
        "Memory Leak": "ScaleUpInstance",
        "Database Connection Error": "RestartDatabase"
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


# Function to fetch new logs since last processed timestamp
def fetch_new_logs(index_name):
    global last_processed_timestamp

    query = {"size": 1000, "query": {"range": {"@timestamp": {"gt": last_processed_timestamp}}}} if last_processed_timestamp else {"size": 1000, "query": {"match_all": {}}}
    response = es.search(index=index_name, body=query)

    logs = []
    for hit in response["hits"]["hits"]:
        logs.append(Document(page_content=hit["_source"]["message"], metadata={"timestamp": hit["_source"]["@timestamp"]}))
    
    # Update last processed timestamp
    if logs:
        last_processed_timestamp = logs[-1].metadata["timestamp"]

    return logs

# Background process function
def process_logs():
    global latest_results

    while True:
        # Fetch new logs
        logs_docs = fetch_new_logs(".ds-filebeat-8.17.0-2025.01.09-000001")

        if not logs_docs:
            print("No new logs found.")
            time.sleep(120)  # Wait 2 minutes before checking again
            continue

        # Create FAISS retriever
        vectorstore = FAISS.from_documents(logs_docs, embedding=embedding_model)
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": len(logs_docs)})  

        # Create Retrieval Chains
        qa_chain_summary = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template_summary)
        qa_chain_root_cause = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template_root_cause)
        qa_chain_automation = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=automation_prompt_template)

        # Run all operations and update results
        latest_results["summary"] = summary_output_parser.parse(qa_chain_summary.invoke({"query": "Summarize logs"})["result"])
        latest_results["root_cause"] = root_cause_output_parser.parse(qa_chain_root_cause.invoke({"query": "Find root cause"})["result"])
        latest_results["automation"] = automation_output_parser.parse(qa_chain_automation.invoke({"query": "Determine automation job"})["result"])

        print("Updated Results:", latest_results)

        time.sleep(120)  # Fetch logs every 2 minutes to fit in Gemini free tier

# API Endpoints
@app.get("/summary")
def get_summary():
    return latest_results["summary"]

@app.get("/root_cause")
def get_root_cause():
    return latest_results["root_cause"]

@app.get("/automation")
def get_automation():
    return latest_results["automation"]

# Start Background Thread
threading.Thread(target=process_logs, daemon=True).start()
