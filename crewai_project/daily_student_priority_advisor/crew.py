"""
Daily Student Priority Advisor Crew
"""
import os
from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai_tools import FileReadTool
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@CrewBase
class DailyStudentPriorityAdvisorCrew:
    """DailyStudentPriorityAdvisor crew"""

    agents_config = 'config/agents.yaml'
    tasks_config = 'config/tasks.yaml'

    def __init__(self):
        # Initialize the LLM with Google Gemini
        self.llm = ChatGoogleGenerativeAI(
            model="gemini/gemini-2.5-flash",
            temperature=0.7,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

    @agent
    def pdf_planning_reader(self) -> Agent:
        return Agent(
            config=self.agents_config["pdf_planning_reader"],
            tools=[FileReadTool()],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=25,
        )

    @agent
    def daily_priority_decision_maker(self) -> Agent:
        return Agent(
            config=self.agents_config["daily_priority_decision_maker"],
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=25,
        )

    @agent
    def student_decision_advisor(self) -> Agent:
        return Agent(
            config=self.agents_config["student_decision_advisor"],
            tools=[],
            llm=self.llm,
            verbose=True,
            allow_delegation=False,
            max_iter=25,
        )

    @task
    def extract_pdf_planning_data(self) -> Task:
        return Task(
            config=self.tasks_config["extract_pdf_planning_data"],
            markdown=False,
        )

    @task
    def make_daily_priority_decision(self) -> Task:
        return Task(
            config=self.tasks_config["make_daily_priority_decision"],
            markdown=False,
        )

    @task
    def provide_final_decision(self) -> Task:
        return Task(
            config=self.tasks_config["provide_final_decision"],
            markdown=False,
        )

    @crew
    def crew(self) -> Crew:
        """Creates the DailyStudentPriorityAdvisor crew"""
        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator
            tasks=self.tasks,  # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
        )