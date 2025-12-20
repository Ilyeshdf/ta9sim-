"""
Mock server that simulates the Daily Student Priority Advisor functionality
This is a simplified version that works with Python 3.9 and provides the same API interface
"""
import os
import json
import time
from flask import Flask, request, jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

def mock_pdf_analysis(pdf_content):
    """Mock function to simulate PDF analysis"""
    # In a real implementation, this would use AI to analyze the PDF
    return {
        "classes": [
            {"name": "Data Structures", "time": "10:00 AM", "days": "Mon, Wed, Fri", "location": "Room 301", "instructor": "Dr. Smith"},
        ],
        "exams": [
            {"name": "Data Structures Midterm", "date": "2024-12-23", "time": "9:00 AM", "module": "CS-301", "location": "Hall A", "weight": 30},
        ],
        "assignments": [
            {"name": "Binary Tree Implementation", "deadline": "2024-12-22", "module": "CS-301", "weight": 20, "description": "Implement binary tree operations"},
        ],
        "commitments": [
            {"name": "Study Group", "time": "Every Tuesday 6 PM", "recurrence": "weekly", "category": "Academic"},
        ],
        "modules": [
            {"code": "CS-301", "name": "Data Structures", "importance": "high", "credits": 4},
        ],
        "confidence": 0.95
    }

def mock_priority_analysis(planning_data, student_name):
    """Mock function to simulate priority analysis"""
    # In a real implementation, this would use AI to analyze priorities
    return {
        "topPriorityTask": "Binary Tree Implementation",
        "urgencyScore": 0.85,
        "confidenceLevel": 0.92,
        "moduleImportance": "high",
        "reasoning": {
            "deadlineProximity": "Assignment is due in 2 days",
            "moduleWeight": "Assignment carries 20% of final grade",
            "workloadBalance": "Balanced workload with one major task"
        }
    }

def mock_student_recommendation(priority_analysis, planning_data):
    """Mock function to simulate student-friendly recommendation"""
    # In a real implementation, this would use AI to create recommendations
    return {
        "recommendation": "Focus on Data Structures assignment today. Your exam is in 3 days, and this assignment counts 20% toward your final grade.",
        "actionableSteps": [
            "Start with binary tree implementation",
            "Test edge cases thoroughly",
            "Submit before 11:59 PM tonight"
        ],
        "estimatedDuration": "3-4 hours",
        "confidence": 0.92
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Mock Daily Student Priority Advisor API is running"}), 200

@app.route('/run', methods=['POST'])
def run_advisor():
    """Main endpoint that simulates the CrewAI functionality"""
    try:
        # Check if request has the required parts
        if 'file' not in request.files:
            # Handle form data if file is not present
            other_data_str = request.form.get('other_data', '{}')
            try:
                other_data = json.loads(other_data_str)
            except json.JSONDecodeError:
                other_data = {}
        else:
            # Handle file upload
            file = request.files['file']
            other_data_str = request.form.get('other_data', '{}')
            try:
                other_data = json.loads(other_data_str)
            except json.JSONDecodeError:
                other_data = {}
        
        student_name = other_data.get('student_name', 'Student')
        task_description = other_data.get('new_task_description', '')
        confidence_level = other_data.get('confidence_level', 'medium')
        module_coefficient = other_data.get('module_coefficient', 1)
        task_deadline = other_data.get('task_deadline', '')
        
        # Simulate processing time
        time.sleep(1)
        
        # Mock PDF analysis
        extracted_data = mock_pdf_analysis(task_description)
        
        # Mock priority analysis
        priority_analysis = mock_priority_analysis(extracted_data, student_name)
        
        # Mock student recommendation
        student_advice = mock_student_recommendation(priority_analysis, extracted_data)
        
        # Combine results
        result = {
            "success": True,
            "recommendation": student_advice["recommendation"],
            "priority": "high" if priority_analysis["urgencyScore"] > 0.7 else "medium" if priority_analysis["urgencyScore"] > 0.4 else "low",
            "confidence": student_advice["confidence"],
            "extractedData": extracted_data,
            "topPriorityTask": priority_analysis["topPriorityTask"],
            "urgencyScore": priority_analysis["urgencyScore"],
            "reasoning": priority_analysis["reasoning"],
            "actionableSteps": student_advice["actionableSteps"],
            "estimatedDuration": student_advice["estimatedDuration"],
            "message": "Task analyzed successfully"
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

@app.route('/test', methods=['POST'])
def test_advisor():
    """Test endpoint with sample data"""
    try:
        # Sample inputs for testing
        sample_data = {
            'student_name': 'Ahmed',
            'new_task_description': 'Computer Science syllabus with assignments and exams',
            'confidence_level': 'high',
            'module_coefficient': 1.0,
            'task_deadline': '2024-12-30'
        }
        
        # Mock PDF analysis
        extracted_data = mock_pdf_analysis(sample_data['new_task_description'])
        
        # Mock priority analysis
        priority_analysis = mock_priority_analysis(extracted_data, sample_data['student_name'])
        
        # Mock student recommendation
        student_advice = mock_student_recommendation(priority_analysis, extracted_data)
        
        # Combine results
        result = {
            "success": True,
            "recommendation": student_advice["recommendation"],
            "priority": "high" if priority_analysis["urgencyScore"] > 0.7 else "medium" if priority_analysis["urgencyScore"] > 0.4 else "low",
            "confidence": student_advice["confidence"],
            "extractedData": extracted_data,
            "topPriorityTask": priority_analysis["topPriorityTask"],
            "urgencyScore": priority_analysis["urgencyScore"],
            "reasoning": priority_analysis["reasoning"],
            "actionableSteps": student_advice["actionableSteps"],
            "estimatedDuration": student_advice["estimatedDuration"],
            "message": "Task analyzed successfully"
        }
        
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Server error: {str(e)}"
        }), 500

if __name__ == '__main__':
    print("Starting Mock Daily Student Priority Advisor Server...")
    print("Server will be available at http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)