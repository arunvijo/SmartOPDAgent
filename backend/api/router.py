# In api/router.py

import re
import pandas as pd

# These imports will eventually work once your teammates create the files.
# For now, they will show an error, which is expected.
from crews.booking_crew import run_booking_crew
from crews.recommendation_crew import run_recommendation_crew

def _is_direct_booking_request(message: str) -> str | None:
    """
    Checks if a message contains a doctor's name.
    Returns the doctor's name if found, otherwise None.
    """
    try:
        doctors_df = pd.read_csv('./data/doctors.csv')
        for doc_name in doctors_df['doctor_name']:
            # Use regex for flexible matching (e.g., "dr. sharma", "dr sharma")
            if re.search(r'\b' + doc_name.replace("Dr. ", "") + r'\b', message, re.IGNORECASE):
                return doc_name
        return None
    except FileNotFoundError:
        # If the data isn't ready, assume it's not a direct request.
        return None

def route_request(user_message: str) -> str:
    """
    Analyzes the user's message and routes it to the appropriate crew.
    This is the key function that enables parallel work.
    """
    print(f"Routing message: '{user_message}'")
    
    doctor_name = _is_direct_booking_request(user_message)
    
    if doctor_name:
        print(f"Doctor '{doctor_name}' detected. Routing to booking crew.")
        # This function will be built by Developer 4.
        # It takes the original message and the identified doctor's name.
        response = run_booking_crew(patient_query=user_message, doctor_name=doctor_name)
    else:
        print("No specific doctor found. Routing to recommendation crew.")
        # This function will be built by Developer 3.
        # It takes the user's issue to find a doctor.
        response = run_recommendation_crew(patient_issue=user_message)
        
    return response