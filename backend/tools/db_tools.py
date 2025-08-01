# In backend/tools/db_tools.py

import pandas as pd
from crewai.tools import BaseTool
from datetime import datetime
from typing import Type

APPOINTMENTS_FILE = './data/appointments.csv'

class CheckScheduleTool(BaseTool):
    name: str = "Check Doctor Schedule"
    description: str = "Checks the schedule for a given doctor and returns a list of available time slots."

    def _run(self, doctor_name: str) -> str:
        slots = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"]
        return f"Available slots for {doctor_name} today are: {', '.join(slots)}."

class BookAppointmentTool(BaseTool):
    name: str = "Book Appointment"
    description: str = "Books an appointment. Expects a single string: 'Doctor Name,Patient Name,Time Slot'"

    def _run(self, booking_details: str) -> str:
        try:
            doctor_name, patient_name, time_slot = [item.strip() for item in booking_details.split(',')]
            docs_df = pd.read_csv('./data/doctors.csv')
            doc_id = docs_df[docs_df['doctor_name'] == doctor_name]['doctor_id'].values[0]
            new_appointment = {
                'appointment_id': f'A{pd.read_csv(APPOINTMENTS_FILE).shape[0] + 10}',
                'doctor_id': doc_id,
                'patient_name': patient_name,
                'appointment_time': f"{datetime.now().strftime('%Y-%m-%d')} {time_slot}",
                'status': 'BOOKED'
            }
            pd.DataFrame([new_appointment]).to_csv(APPOINTMENTS_FILE, mode='a', header=False, index=False)
            return f"Successfully booked appointment for {patient_name} with {doctor_name} at {time_slot}."
        except Exception as e:
            return f"Error booking appointment: {e}."

# Instantiate the tools for export
check_schedule_tool = CheckScheduleTool()
book_appointment_tool = BookAppointmentTool()