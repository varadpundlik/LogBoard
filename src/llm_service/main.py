from langchain_community.vectorstores import ElasticsearchStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from elasticsearch import Elasticsearch
from langchain_ollama import ChatOllama
import json

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

# Create embeddings and store in Elasticsearch
vectorstore = ElasticsearchStore.from_documents(
    logs_docs,
    embedding=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"),  
    index_name="logs_vector_index",
    es_connection=es
)

# Set up the retriever
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})  

# Initialize the LLM (Ollama with DeepSeek model)
llm_engine = ChatOllama(
    model="deepseek-r1:1.5b",  
    base_url="http://localhost:11434",
    temperature=0.3
)

# Log Summarization Prompt
prompt_template_summary = PromptTemplate(
    input_variables=["context"],  
    template="""
    You are an expert at log analysis. Categorize logs into **distinct API operations** and generate a structured JSON output.
    
    Return ONLY JSON in the format:
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
    """
)


qa_chain_summary = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template_summary)

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
    """
)


qa_chain_root_cause = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template_root_cause)

def extract_json(response):
    """Extract and parse JSON from the LLM response."""
    try:
        # Find the first `{` which starts a JSON block
        json_start = response.find("{")
        json_data = response[json_start:].strip()

        # Load JSON
        parsed_json = json.loads(json_data)
        return json.dumps(parsed_json, indent=4)  # Pretty print
    except json.JSONDecodeError:
        return "Error: Unable to parse JSON from response."

# Invoke Log Summary
query_logs = {"query": "Summarize the logs"}
op1 = qa_chain_summary.invoke(query_logs)
print("Log Summary Output:\n", extract_json(op1['result']))

print("\n\n-----------------------------------\n\n")

# Invoke Root Cause Analysis
query_root_cause = {"query": "Identify the root cause of the errors"}
op2 = qa_chain_root_cause.invoke(query_root_cause)
print("Root Cause Analysis Output:\n", extract_json(op2['result']))