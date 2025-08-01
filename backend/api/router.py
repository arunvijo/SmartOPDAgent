# In backend/api/router.py

import re
import pandas as pd
from tools.vector_store_tools import find_doctor_tool
from tools.db_tools import check_schedule_tool

def _is_direct_booking_request(message: str) -> str | None:
    try:
        doctors_df = pd.read_csv('./data/doctors.csv')
        for doc_name in doctors_df['doctor_name']:
            if re.search(r'\b' + doc_name.replace("Dr. ", "") + r'\b', message, re.IGNORECASE):
                return doc_name
        return None
    except FileNotFoundError:
        return None

def route_request(user_message: str) -> str:
    doctor_name = _is_direct_booking_request(user_message)
    
    if doctor_name:
        # Call the .run() method of the tool object
        response = check_schedule_tool.run(doctor_name)
    else:
        # Call the .run() method of the tool object
        recommended_ids = find_doctor_tool.run(user_message)
        if not recommended_ids:
            response = "I'm sorry, I couldn't find a suitable doctor for your issue."
        else:
            docs_df = pd.read_csv('./data/doctors.csv')
            first_doc_id = recommended_ids[0]
            doc_info = docs_df[docs_df['doctor_id'] == first_doc_id].iloc[0]
            response = f"Based on your issue, I recommend Dr. {doc_info['doctor_name']}, a {doc_info['specialty']}. Would you like to see their schedule?"
            
    return response