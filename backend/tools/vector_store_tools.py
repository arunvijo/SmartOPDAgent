# In backend/tools/vector_store_tools.py

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from crewai.tools import BaseTool
import os
from dotenv import load_dotenv
from typing import List, Type
import chromadb
import chromadb.utils.embedding_functions as embedding_functions

load_dotenv()

# --- 1. CREATE A WRAPPER CLASS FOR GEMINI ---
# This class ensures compatibility between LangChain's Gemini object
# and what ChromaDB expects.
class GeminiEmbeddingFunction(embedding_functions.EmbeddingFunction):
    def __init__(self):
        # Instantiate the LangChain object for Gemini embeddings
        self.client = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

    # This is the function that ChromaDB will call.
    def __call__(self, input: List[str]) -> List[List[float]]:
        # Call the underlying LangChain object's method
        return self.client.embed_documents(input)

# --- 2. SETUP WITH THE WRAPPER ---
client = chromadb.PersistentClient(path="./db_storage")

# Instantiate our custom Gemini wrapper class
embedding_function = GeminiEmbeddingFunction()

# Pass our compatible wrapper to ChromaDB
feedback_collection = client.get_or_create_collection(
    name="patient_feedback",
    embedding_function=embedding_function
)

# --- 3. THE TOOL DEFINITION (No changes needed here) ---
class FindDoctorTool(BaseTool):
    name: str = "Find Suitable Doctor"
    description: str = "Searches the patient feedback database to recommend doctors for a given medical issue."

    def _run(self, patient_issue: str) -> List[str]:
        try:
            results = feedback_collection.query(
                query_texts=[patient_issue],
                n_results=3
            )
            metadatas = results.get("metadatas", [[]])[0]
            recommended_doctors = [meta.get("doctor_id") for meta in metadatas if isinstance(meta, dict) and meta.get("doctor_id")]
            return recommended_doctors
        except Exception as e:
            return f"Error in find_doctor_for_issue: {e}"

# Instantiate the tool for export
find_doctor_tool = FindDoctorTool()