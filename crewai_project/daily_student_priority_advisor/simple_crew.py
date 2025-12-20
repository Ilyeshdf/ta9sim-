"""
Simple Daily Student Priority Advisor Crew (compatible with Python 3.9)
"""
import os
from typing import Dict, Any, Optional
from crewai import Agent, Crew, Process, Task
from crewai_tools import FileReadTool
from langchain_google_genativeai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class SimpleDailyStudentPriorityAdvisorCrew:
    """SimpleDailyStudentPriorityAdvisor crew"""

    def __init__(self):
        # Initialize the LLM with Google Gemini
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini/gemini-2.5-flash",
                temperature=0.7,
                google_api_key=os.getenv("GOOGLE_API_KEY")
            )
        except Exception as e:
            print(f"Warning: Could not initialize Gemini LLM: {e}")
            # Fallback to a simple configuration
            self.llm = None

    def pdf_planning_reader(self) -> Agent:
        return Agent(
            role="PDF Academic Planning Reader",
            goal="Extract academic planning information from student PDF documents",
            backstory="You are an expert document analyzer specialized in extracting structured academic planning data from various PDF formats.",
            tools=[FileReadTool()],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=25,
        )

    def daily_priority_decision_maker(self) -> Agent:
        return Agent(
            role="Daily Academic Priority Decision Maker",
            goal="Analyze extracted planning data to determine the most urgent activities",
            backstory="You are an academic planning expert that helps students prioritize their daily tasks.",
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=25,
        )

    def student_decision_advisor(self) -> Agent:
        return Agent(
            role="Student-Friendly Decision Advisor",
            goal="Distill complex priority analyses into clear, actionable sentences",
            backstory="You are a student success coach that translates complex academic planning into simple, actionable advice.",
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=25,
        )

    def extract_pdf_planning_data(self) -> Task:
        return Task(
            description="""Analyze the provided PDF document and extract all academic planning information including:
            1. Classes (name, time, days, location, instructor)
            2. Exams (name, date, time, module, location, weight)
            3. Assignments (name, deadline, module, weight, description)
            4. Commitments (name, time, recurrence, category)
            5. Modules (code, name, importance, credits)
            
            Ensure all dates are in YYYY-MM-DD format and all extracted data is accurate.""",
            expected_output="A structured JSON object containing all extracted planning data",
            agent=self.pdf_planning_reader(),
        )

    def make_daily_priority_decision(self) -> Task:
        return Task(
            description="""Using the extracted planning data, analyze and determine today's highest priority activity. Consider:
            1. Deadline proximity (urgent tasks)
            2. Module importance (high credit/weight modules)
            3. Workload balance (avoid overloading)
            4. Confidence level in the assessment""",
            expected_output="A priority analysis with top priority task and detailed reasoning",
            agent=self.daily_priority_decision_maker(),
        )

    def provide_final_decision(self) -> Task:
        return Task(
            description="""Based on the priority analysis, create a student-friendly recommendation consisting of:
            1. One clear, concise sentence explaining what the student should focus on today
            2. 3-5 actionable steps to accomplish this priority
            3. Estimated duration to complete the task
            4. Confidence level in the recommendation
            
            Communicate in an encouraging, supportive tone that motivates action without causing stress.""",
            expected_output="A student-friendly recommendation with actionable steps and confidence level",
            agent=self.student_decision_advisor(),
        )

    def crew(self) -> Crew:
        """Creates the SimpleDailyStudentPriorityAdvisor crew"""
        return Crew(
            agents=[
                self.pdf_planning_reader(),
                self.daily_priority_decision_maker(),
                self.student_decision_advisor(),
            ],
            tasks=[
                self.extract_pdf_planning_data(),
                self.make_daily_priority_decision(),
                self.provide_final_decision(),
            ],
            process=Process.sequential,
            verbose=True,
        )