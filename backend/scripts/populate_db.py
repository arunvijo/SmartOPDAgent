# In backend/scripts/populate_db.py

import pandas as pd
import sys
import os
from dotenv import load_dotenv # <-- ADD THIS

# --- ADD THIS LINE TO LOAD THE .env FILE ---
load_dotenv()

# Add the parent directory to the path to allow imports from `tools`
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import the collection, which already knows how to use OpenRouter
from tools.vector_store_tools import feedback_collection

def populate_vector_store():
    """Reads feedback.csv and populates the ChromaDB vector store using OpenRouter."""
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        csv_path = os.path.join(script_dir, '..', 'data', 'feedback.csv')

        existing_ids = feedback_collection.get()['ids']
        if existing_ids:
            print(f"Clearing {len(existing_ids)} existing documents from the collection...")
            feedback_collection.delete(ids=existing_ids)
        else:
            print("Collection is empty, no documents to clear.")
        
        df = pd.read_csv(csv_path)
        
        print(f"Found {len(df)} records in feedback.csv. Populating vector store...")
        
        feedback_collection.add(
            documents=df["patient_issue"].tolist(),
            metadatas=[{"doctor_id": row["doctor_id"]} for index, row in df.iterrows()],
            ids=[str(f_id) for f_id in df["feedback_id"].tolist()]
        )
        print("Vector store populated successfully!")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    populate_vector_store()