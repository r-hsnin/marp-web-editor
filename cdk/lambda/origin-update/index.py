import boto3
import os


def handler(event, context):
    """
    EC2 起動完了時に CloudFront オリジンを更新する Lambda
    EventBridge (EC2 state: running) からトリガーされる
    """
    cf = boto3.client("cloudfront")
    ec2 = boto3.client("ec2")

    distribution_id = os.environ["CLOUDFRONT_DISTRIBUTION_ID"]
    origin_id = os.environ["ORIGIN_ID"]
    instance_id = event["detail"]["instance-id"]

    # Get the new public DNS name
    resp = ec2.describe_instances(InstanceIds=[instance_id])
    public_dns = resp["Reservations"][0]["Instances"][0].get("PublicDnsName")

    if not public_dns:
        print(f"No public DNS for instance {instance_id}")
        return {"status": "skipped", "reason": "no_public_dns"}

    # Get current distribution config
    dist = cf.get_distribution_config(Id=distribution_id)
    config = dist["DistributionConfig"]
    etag = dist["ETag"]

    # Update the origin domain name
    for origin in config["Origins"]["Items"]:
        if origin["Id"] == origin_id:
            origin["DomainName"] = public_dns
            break

    # Update distribution
    cf.update_distribution(
        Id=distribution_id,
        DistributionConfig=config,
        IfMatch=etag,
    )

    print(f"Updated CloudFront origin {origin_id} to {public_dns}")
    return {"status": "updated", "origin": origin_id, "domain": public_dns}
