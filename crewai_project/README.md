# Daily Student Priority Advisor - CrewAI Project

This project implements a CrewAI-based system for helping students prioritize their academic tasks based on their course materials and schedules.

## Project Structure

```
crewai_project/
├── daily_student_priority_advisor/
│   ├── config/
│   │   ├── agents.yaml
│   │   └── tasks.yaml
│   ├── crew.py
│   └── __init__.py
├── server.py
├── main.py
├── requirements.txt
├── pyproject.toml
└── .env.example
```

## Setup Instructions

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Copy `.env.example` to `.env` and fill in your Google API key:
   ```bash
   cp .env.example .env
   ```

3. Run the Flask server:
   ```bash
   python server.py
   ```

4. The server will start on `http://localhost:5000`

## API Endpoints

- `POST /run` - Process a PDF document and generate priority recommendations
- `POST /test` - Test the system with sample data
- `GET /health` - Health check endpoint

## How It Works

The system uses three AI agents working together:

1. **PDF Planning Reader** - Extracts academic planning information from PDF documents
2. **Daily Priority Decision Maker** - Analyzes extracted data to determine priorities
3. **Student Decision Advisor** - Creates student-friendly recommendations

## Integration with Mobile App

The mobile app communicates with this service through the `/run` endpoint, sending PDF documents and receiving prioritized recommendations.