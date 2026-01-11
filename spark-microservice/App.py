from fastapi import FastAPI, HTTPException
from controller import submit_job

from dotenv import load_dotenv
# Load variables from .env file
load_dotenv()

app = FastAPI(title="Spark Job Microservice")


@app.post("/submit-job")
def submit_job_endpoint(request_json: dict):
    """
    Endpoint to submit a Spark job.
    Request JSON structure is validated in the controller.
    """
    try:
        # Call the controller function
        result = submit_job(request_json)
        return {
            "status": "SUCCESS",
            "data": result
        }
    except Exception as e:
        # Return 400 for validation or execution errors
        raise HTTPException(status_code=400, detail=str(e))