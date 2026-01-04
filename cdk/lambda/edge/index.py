import boto3

# Replaced at deploy time by CDK
INSTANCE_TAG = "{{INSTANCE_TAG}}"


def handler(event, context):
    response = event["Records"][0]["cf"]["response"]

    if int(response["status"]) >= 500:
        # Trigger EC2 start if stopped (no splash page - frontend handles gracefully)
        ec2 = boto3.client("ec2", region_name="us-east-1")
        try:
            resp = ec2.describe_instances(
                Filters=[
                    {"Name": "tag:Name", "Values": [INSTANCE_TAG]},
                    {"Name": "instance-state-name", "Values": ["stopped"]},
                ]
            )
            for r in resp.get("Reservations", []):
                for i in r.get("Instances", []):
                    ec2.start_instances(InstanceIds=[i["InstanceId"]])
        except Exception as e:
            print(f"Error: {e}")

    return response
