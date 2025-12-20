"""
Demo script showing the core functionality of the Daily Student Priority Advisor
This is a simplified version that works with Python 3.9
"""
import os
from crewai import Agent, Crew, Process, Task
from crewai_tools import FileReadTool
from langchain_google_generativeai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_daily_student_priority_advisor():
    """Create and run the daily student priority advisor crew"""
    
    # Initialize the LLM with Google Gemini
    try:
        llm = ChatGoogleGenerativeAI(
            model="gemini/gemini-2.5-flash",
            temperature=0.7,
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
    except Exception as e:
        print(f"Warning: Could not initialize Gemini LLM: {e}")
        print("Using fallback configuration")
        llm = None

    # Create agents
    pdf_reader = Agent(
        role="PDF Academic Planning Reader",
        goal="Extract academic planning information from student PDF documents",
        backstory="You are an expert document analyzer specialized in extracting structured academic planning data from various PDF formats.",
        tools=[FileReadTool()],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    priority_analyzer = Agent(
        role="Daily Academic Priority Decision Maker",
        goal="Analyze extracted planning data to determine the most urgent activities",
        backstory="You are an academic planning expert that helps students prioritize their daily tasks.",
        tools=[],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    student_advisor = Agent(
        role="Student-Friendly Decision Advisor",
        goal="Distill complex priority analyses into clear, actionable sentences",
        backstory="You are a student success coach that translates complex academic planning into simple, actionable advice.",
        tools=[],
        llm=llm,
        verbose=True,
        allow_delegation=False,
    )

    # Create tasks
    extract_task = Task(
        description="""Analyze the provided PDF document and extract all academic planning information including:
        1. Classes (name, time, days, location, instructor)
        2. Exams (name, date, time, module, location, weight)
        3. Assignments (name, deadline, module, weight, description)
        4. Commitments (name, time, recurrence, category)
        5. Modules (code, name, importance, credits)
        
        Ensure all dates are in YYYY-MM-DD format and all extracted data is accurate.""",
        expected_output="A structured JSON object containing all extracted planning data",
        agent=pdf_reader,
    )

    analyze_task = Task(
        description="""Using the extracted planning data, analyze and determine today's highest priority activity. Consider:
        1. Deadline proximity (urgent tasks)
        2. Module importance (high credit/weight modules)
        3. Workload balance (avoid overloading)
        4. Confidence level in the assessment""",
        expected_output="A priority analysis with top priority task and detailed reasoning",
        agent=priority_analyzer,
    )

    recommend_task = Task(
        description="""Based on the priority analysis, create a student-friendly recommendation consisting of:
        1. One clear, concise sentence explaining what the student should focus on today
        2. 3-5 actionable steps to accomplish this priority
        3. Estimated duration to complete the task
        4. Confidence level in the recommendation
        
        Communicate in an encouraging, supportive tone that motivates action without causing stress.""",
        expected_output="A student-friendly recommendation with actionable steps and confidence level",
        agent=student_advisor,
    )

    # Create and run the crew
    crew = Crew(
        agents=[pdf_reader, priority_analyzer, student_advisor],
        tasks=[extract_task, analyze_task, recommend_task],
        process=Process.sequential,
        verbose=True,
    )

    return crew

if __name__ == "__main__":
    print("Creating Daily Student Priority Advisor...")
    crew = create_daily_student_priority_advisor()
    print("Crew created successfully!")
    
    # Example inputs (in a real scenario, these would come from the mobile app)
    inputs = {
        'student_name': 'Ahmed',
        'current_date': '2024-12-20',
        'pdf_content': 'Sample PDF content for testing'
    }
    
    print("Running crew with sample inputs...")
    try:
        result = crew.kickoff(inputs=inputs)
        print("Crew completed successfully!")
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error running crew: {e}")