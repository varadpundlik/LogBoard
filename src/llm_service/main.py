from fastapi import FastAPI
from pydantic import BaseModel
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from elasticsearch import Elasticsearch
from langchain_ollama import ChatOllama
from langchain.output_parsers import StructuredOutputParser, ResponseSchema
from pydantic import BaseModel
from typing import Dict
import json

app = FastAPI()

# Connect to Elasticsearch
es = Elasticsearch("http://localhost:9200")

# Fetch logs from Elasticsearch
def fetch_logs(index_name):
    query = {"size": 1000, "query": {"match_all": {}}}
    response = es.search(index=index_name, body=query)
    
    docs = [
        Document(page_content=hit["_source"]["message"], metadata={"timestamp": hit["_source"]["@timestamp"]})
        for hit in response["hits"]["hits"]
    ]
    
    return docs

# Fetch logs
logs_docs = fetch_logs(".ds-filebeat-8.17.0-2025.01.09-000001")
# logs_docs=fetch_logs(".ds-filebeat-8.17.1-2025.02.04-000001")

# Create embeddings
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")  
vectorstore = FAISS.from_documents(logs_docs, embedding=embedding_model)
# Set up the retriever
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": len(logs_docs)})  

# Initialize the LLM (Ollama with DeepSeek model)
llm_engine = ChatOllama(
    model="deepseek-r1:1.5b",  
    base_url="http://localhost:11434",
    temperature=0.3
)

# Define response schemas for log summarization
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
    ResponseSchema(name="job", description="Recommemded Automation job name (None if any job is not required)", type="string")
]

# Create output parsers
summary_output_parser = StructuredOutputParser.from_response_schemas(summary_response_schemas)
root_cause_output_parser = StructuredOutputParser.from_response_schemas(root_cause_response_schemas)
automation_output_parser = StructuredOutputParser.from_response_schemas(automation_response_schemas)

# Log Summarization Prompt
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
    input_variables=["query", "error_to_job_mapping"],  # Add "query" and "error_to_job_mapping"
    template="""
    You are an expert in automation. Based on the logs provided, identify the error and recommend an automation job.

    Use the provided mapping to determine the correct job for each error.

    Logs:
    {context}

    Error-to-Job Mapping:
    {error_to_job_mapping}

    {format_instructions}
    """,
    partial_variables={"format_instructions": automation_output_parser.get_format_instructions()}
)

qa_chain_summary = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template_summary)
qa_chain_root_cause = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template_root_cause)
qa_chain_automation = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=automation_prompt_template)

def extract_json(response):
    """Extract and parse JSON from the LLM response."""
    try:
        # Find the first `{` which starts a JSON block
        json_start = response.find("{")
        json_data = response[json_start:].strip()

        # Load JSON
        parsed_json = json.loads(json_data)
        return json.dumps(parsed_json, indent=4)  # Pretty print
        # return parsed_json
    except json.JSONDecodeError:
        return "Error: Unable to parse JSON from response."

# # Invoke Log Summary
# query_logs = {"query": "Summarize the logs"}
# op1 = qa_chain_summary.invoke(query_logs)
# print("Log Summary Output:\n", extract_json(op1['result']))

# print("\n\n-----------------------------------\n\n")

# # Invoke Root Cause Analysis
# query_root_cause = {"query": "Identify the root cause of the errors"}
# op2 = qa_chain_root_cause.invoke(query_root_cause)
# print("Root Cause Analysis Output:\n", extract_json(op2['result']))

# Request model for API inputs
# class QueryRequest(BaseModel):
#     query: str

@app.post("/summarize_logs")
def summarize_logs():
    """Endpoint to summarize logs"""
    query = {"query": "Summarize the logs"}  # Hardcoded query
    response = qa_chain_summary.invoke(query)
    print("Log Summary Output:\n",response['result'])
    parsed_response = summary_output_parser.parse(response["result"])
    return parsed_response

@app.post("/root_cause_analysis")
def root_cause_analysis():
    """Endpoint to perform root cause analysis on logs."""
    query = {"query":"Identify the root cause of the errors"}
    response = qa_chain_root_cause.invoke(query)
    print("Root Cause Analysis Output:\n",response['result'])
    parsed_response = root_cause_output_parser.parse(response["result"])
    return parsed_response

class AutomationRequest(BaseModel):
    error_to_job_mapping: Dict[str, str]

@app.post("/automation")
async def automation(request: AutomationRequest):
    """Endpoint to recommend an automation job based on logs and provided error-job mapping."""
    
    # Prepare the query with the error_to_job_mapping
    query = {
        "query": "Recommend an automation job",
        "error_to_job_mapping": request.error_to_job_mapping  # Pass the error-to-job mapping
    }
    
    # Invoke the QA chain with the query
    response = qa_chain_automation.invoke(query)
    print("Automation Output:\n", response['result'])
    
    # Parse the response using the output parser
    parsed_response = automation_output_parser.parse(response["result"])
    return parsed_response
# Run the API with: uvicorn main:app --host 0.0.0.0 --port 5001 --reload