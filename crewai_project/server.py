"""
Flask server to expose the Daily Student Priority Advisor CrewAI functionality as an API
"""
import os
import tempfile
import json
from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from daily_student_priority_advisor.crew import DailyStudentPriorityAdvisorCrew

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Daily Student Priority Advisor API is running"}), 200

@app.route('/run', methods=['POST'])
def run_crew():
    """Run the Daily Student Priority Advisor Crew with provided inputs"""
    try:
        # Check if request has the required parts
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No PDF file provided"}), 400
            
        file = request.files['file']
        
        # Check if file is selected
        if file.filename == '':
            return jsonify({"success": False, "error": "No file selected"}), 400
            
        # Validate file type
        if not allowed_file(file.filename):
            return jsonify({"success": False, "error": "Invalid file type. Only PDF files are allowed"}), 400
        
        # Get other data from form
        other_data_str = request.form.get('other_data', '{}')
        try:
            other_data = json.loads(other_data_str)
        except json.JSONDecodeError:
            return jsonify({"success": False, "error": "Invalid JSON in other_data field"}), 400
        
        # Create a temporary file to save the uploaded PDF
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
            file.save(tmp_file.name)
            tmp_filename = tmp_file.name
        
        try:
            # Prepare inputs for the crew
            inputs = {
                'student_name': other_data.get('student_name', 'Student'),
                'current_date': other_data.get('current_date', ''),
                'task_deadline': other_data.get('task_deadline', ''),
                'module_coefficient': other_data.get('module_coefficient', 1),
                'confidence_level': other_data.get('confidence_level', 'medium'),
                'new_task_description': other_data.get('new_task_description', ''),
                'pdf_file_path': tmp_filename
            }
            
            # Run the crew
            crew = DailyStudentPriorityAdvisorCrew()
            result = crew.crew().kickoff(inputs=inputs)
            
            # Return the result
            response = {
                "success": True,
                "recommendation": str(result),
                "inputs_used": inputs
            }
            return jsonify(response), 200
            
        finally:
            # Clean up the temporary file
            os.unlink(tmp_filename)
            
    except Exception as e:
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500

@app.route('/test', methods=['POST'])
def test_crew():
    """Test endpoint with sample data"""
    try:
        # Sample inputs for testing
        inputs = {
            'student_name': 'Ahmed',
            'current_date': '2024-12-20',
            'pdf_content': 'Sample PDF content for testing purposes'
        }
        
        # Run the crew
        crew = DailyStudentPriorityAdvisorCrew()
        result = crew.crew().kickoff(inputs=inputs)
        
        # Return the result
        response = {
            "success": True,
            "result": str(result),
            "inputs_used": inputs
        }
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)