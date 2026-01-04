import boto3
import os
from datetime import datetime, timedelta


def handler(event, context):
    ec2 = boto3.client("ec2")
    cw = boto3.client("cloudwatch")
    instance_id = os.environ["INSTANCE_ID"]
    idle_minutes = int(os.environ["IDLE_MINUTES"])
    dist_id = os.environ["CLOUDFRONT_DISTRIBUTION_ID"]

    # Check instance state
    resp = ec2.describe_instances(InstanceIds=[instance_id])
    state = resp["Reservations"][0]["Instances"][0]["State"]["Name"]
    if state != "running":
        return {"status": state, "action": "none"}

    # Check CloudFront request count
    end = datetime.utcnow()
    start = end - timedelta(minutes=idle_minutes)
    metrics = cw.get_metric_statistics(
        Namespace="AWS/CloudFront",
        MetricName="Requests",
        Dimensions=[
            {"Name": "DistributionId", "Value": dist_id},
            {"Name": "Region", "Value": "Global"},
        ],
        StartTime=start,
        EndTime=end,
        Period=idle_minutes * 60,
        Statistics=["Sum"],
    )

    total_requests = sum(dp["Sum"] for dp in metrics.get("Datapoints", []))
    if total_requests == 0:
        ec2.stop_instances(InstanceIds=[instance_id])
        return {"status": "stopping", "action": "stopped", "idle_minutes": idle_minutes}

    return {"status": "running", "action": "none", "requests": total_requests}
