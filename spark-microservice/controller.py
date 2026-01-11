from typing import Dict
from storage import S3Storage 
from service import PipelineService

#for getting env vars
import os

def validate_request_json(request_json: Dict):
    """
    Validates the incoming JSON structure.
    Raises ValueError if invalid.
    """
    # Required top-level keys
    required_keys = ["job_id", "s3_path", "job_config"]
    for key in required_keys:
        if key not in request_json:
            raise ValueError(f"Missing required key: {key}")

    # job_id must be non-empty string
    if not isinstance(request_json["job_id"], str) or not request_json["job_id"].strip():
        raise ValueError("job_id must be a non-empty string")

    # s3_path must be non-empty string
    if not isinstance(request_json["s3_path"], str) or not request_json["s3_path"].strip():
        raise ValueError("s3_path must be a non-empty string")

    # job_config must be dict
    job_config = request_json["job_config"]
    if not isinstance(job_config, dict):
        raise ValueError("job_config must be a dict")

    # job_config must have type and tasks
    if "type" not in job_config or "tasks" not in job_config:
        raise ValueError("job_config must contain 'type' and 'tasks' keys")

    if job_config["type"] not in ["descriptive", "ml"]:
        raise ValueError("job_config.type must be 'descriptive' or 'ml'")

    if not isinstance(job_config["tasks"], list) or not job_config["tasks"]:
        raise ValueError("job_config.tasks must be a non-empty list")

    # node_list is optional; if provided, must be list of integers
    if "node_list" in request_json:
        node_list = request_json["node_list"]
        if not isinstance(node_list, list) or not all(isinstance(n, int) for n in node_list):
            raise ValueError("node_list must be a list of integers")

# Load S3 credentials from environment variables
S3_ACCESS_KEY = os.environ.get("S3_ACCESS_KEY")
S3_SECRET_KEY = os.environ.get("S3_SECRET_KEY")
S3_ENDPOINT = os.environ.get("S3_ENDPOINT")
S3_BUCKET_NAME = os.environ.get("S3_BUCKET_NAME")
S3_REGION = os.environ.get("S3_REGION", "us-east-1") 

S3_Config = {
    "bucket": S3_BUCKET_NAME,
    "access_key": S3_ACCESS_KEY,
    "secret_key": S3_SECRET_KEY,
    "endpoint_url": S3_ENDPOINT,
    "region": S3_REGION
}


def submit_job(request_json: Dict):
    """
    Controller function:
    - validates JSON
    - creates storage (fixed S3)
    - calls service
    - returns result
    """

    # Validate JSON structure
    validate_request_json(request_json)

    # Create S3 storage instance  
    storage = S3Storage (
        bucket_name=S3_Config["bucket"],
        aws_access_key=S3_Config["access_key"],
        aws_secret_key=S3_Config["secret_key"],
        endpoint_url=S3_Config.get("endpoint_url"),
        region=S3_Config.get("region", "global-1")
    )

    # Create pipeline service
    service = PipelineService(storage)

    # Execute pipeline
    result = service.execute_pipeline(
        job_id=request_json["job_id"],
        s3_path=request_json["s3_path"],
        job_config=request_json["job_config"],
        node_list=request_json.get("node_list", [1, 2, 4, 8])
    )

    # Return result
    return result