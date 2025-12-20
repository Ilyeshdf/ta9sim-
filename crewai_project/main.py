"""
Main entry point for the Daily Student Priority Advisor CrewAI system
"""
import os
from daily_student_priority_advisor.crew import DailyStudentPriorityAdvisorCrew

def run():
    """
    Run the crew.
    """
    inputs = {
        'student_name': 'Ahmed',
        'current_date': '2024-12-20',
        'pdf_content': 'Sample PDF content for testing'
    }
    DailyStudentPriorityAdvisorCrew().crew().kickoff(inputs=inputs)

if __name__ == "__main__":
    run()