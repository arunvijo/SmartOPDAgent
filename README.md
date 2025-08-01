# SmartOPDAgent – Multi-Agent AI System for Hospital OPD Management

> Developed as part of **IBM SkillsBuild Summer Internship**  
> Final Submission Deadline: **August 7, 2025**  
> Team Size: 6 Members  
> SDG Focus: [Goal 3 – Good Health & Well-being](https://sdgs.un.org/goals/goal3)

---

## Project Overview

SmartOPDAgent is an intelligent **multi-agent AI chatbot system** designed to streamline hospital OPD (Outpatient Department) visits. The system uses two specialized AI agents, coordinated by a central agent, to:

- Book doctor-specific appointments
- Recommend the most suitable doctors based on symptoms
- Guide patients in real-time (traffic updates, crowd data, reminders)

This project addresses the core challenges in outpatient services, such as long wait times, patient confusion, and lack of personalized care — especially in public healthcare systems.

---

## System Architecture
```bash

                +----------------+
                |   Main Agent   |
                +----------------+
                        |
        +---------------+---------------+
        |                               |
  +------------+                 +-------------------+
  |  Agent 1   |                 |     Agent 2       |
  | (Booking & |                 |  (Recommender +   |
  |  Tracking) |                 |  Feedback Matching)|
  +------------+                 +-------------------+
        |                               |
        +---------------+---------------+
                        |
          +--------------------------+
          |  Patient Journey Support |
          +--------------------------+

```
---

## Agents Overview

### Main Agent (Router)
- First point of interaction.
- Detects patient intent:
  - If patient mentions a specific doctor → forwards to **Agent 1**
  - If patient describes symptoms/issues → forwards to **Agent 2**

---

### Agent 1 – Booking & Patient Tracker
- **Checks doctor’s appointment slots**
- **Books available slots**
- Tracks patient journey with:
  - OPD crowd estimation
  - Real-time traffic via API
  - Automated reminders/notifications (SMS/WhatsApp)
- Guides patient till hospital arrival

---

### Agent 2 – Symptom-Based Doctor Recommender
- Uses **vectorized feedback database**
- Matches patient's issue with real patient experiences
- Recommends the most **suitable and available doctor**
- Ensures **equal opportunity** by balancing between senior/junior doctors
- After confirmation, routes back to **Agent 1** for booking

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Programming | Python |
| AI Agent Orchestration | [LangChain](https://www.langchain.com/), OpenRouter |
| Embeddings & Search | FAISS (Vector Store) |
| Web UI / Chat Interface | Streamlit or Flask |
| Real-time Tracking | Google Maps API, Hospital API (mock) |
| Notifications | Twilio / WhatsApp / Email APIs |
| Version Control | Git, GitHub |
| Deployment (optional) | Render / Heroku / Vercel |

---

## Features & Innovation

- **Multi-Agent Orchestration** with task-specific delegation
- **Contextual Feedback Vectorization** for real-world doctor suggestions
- **Real-Time Tracking** of hospital crowd and traffic
- **Equal Opportunity Logic** to prevent bias in doctor assignment
- **Fully Conversational** chatbot with structured routing

---

## Target Impact

- Reduce OPD wait time by 30–50%
- Improve patient satisfaction
- Help hospitals better manage OPD queues
- Increase access to care for semi-urban & rural users

---

## How to Run Locally

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/smart-opd-agent.git
cd smart-opd-agent
```
### 2. Create & Activate Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Run the Application (e.g., Streamlit)
```bash
streamlit run app.py
```

## Demo (Coming Soon)
- Agent 1: Doctor Booking + Notification
- Agent 2: Symptom → Doctor Match
- Vector Feedback DB (mock)
- Real-time simulation (traffic + crowd)

## UN SDG Alignment
This project aligns with UN Sustainable Development Goal 3 – Good Health and Well-Being, by improving access to timely, efficient, and equitable outpatient services.

## Team Members

| Name | Role |
|-------|------------|
| Arun Vijo | Architect + Full-stack Dev |
| Aswin Asokan | AI/NLP Model Dev |
| Abin A C | Backend Engineer |
| Abraham Manoj | Feedback DB & Embedding Logic |
| Aaron Stephen | Streamlit UI / UX |
| Albin Binu | Presentation + Documentation |

## Project Structure

```bash
smart-opd-agent/
├── agent1_booking/
├── agent2_recommender/
├── main_agent_router.py
├── feedback_db/
├── frontend/              # Streamlit or Flask UI
├── utils/
│   └── traffic_api.py
├── requirements.txt
├── README.md
└── .gitignore
```

## License
This project is licensed under the MIT License.

## Contact
For queries or collaboration:

- 📧 arunvijo2004@gmail.com
- GitHub: @arunvijo04


---
