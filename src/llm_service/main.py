from langchain_community.vectorstores import ElasticsearchStore
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.schema import Document
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from elasticsearch import Elasticsearch
from langchain_ollama import ChatOllama


es = Elasticsearch("http://localhost:9200")

def fetch_logs(index_name):
    query = {"size": 1000, "query": {"match_all": {}}}
    response = es.search(index=index_name, body=query)
    
    docs = [
        Document(page_content=hit["_source"]["message"], metadata={"timestamp": hit["_source"]["@timestamp"]})
        for hit in response["hits"]["hits"]
    ]
    
    return docs

logs_docs = fetch_logs(".ds-filebeat-8.17.0-2025.01.09-000001")

vectorstore = ElasticsearchStore.from_documents(
    logs_docs,
    embedding=HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2"),  
    index_name="logs_vector_index",
    es_connection=es
)

retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 10})  

llm_engine=ChatOllama(
    model="deepseek-r1:1.5b",
    base_url="http://localhost:11434",

    temperature=0.3

)

prompt_template = PromptTemplate(
    input_variables=["context"],
    template="Summarize the following logs into distinct API operations, including a title, summary, timestamp, and related log entries:\n\n{context}"
)


qa_chain = RetrievalQA.from_llm(llm=llm_engine, retriever=retriever, prompt=prompt_template)


query = "Summarize the latest API logs related to errors"
summary_output = qa_chain.run(query)

print(summary_output)
