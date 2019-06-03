# -----------------------------------------------------
# AWS
# -----------------------------------------------------
variable "aws_shared_credentials_file" {
    default = "~/.aws/credentials"
}

variable "aws_region" {
    description = "The region to deploy in"
    default     = "us-east-1"
}

variable "aws_profile" {
    description = "The profile to use"
    default     = "default"
}

# -----------------------------------------------------
# Cloudflare
# -----------------------------------------------------
variable "cloudflare_email" {
    description = "Email of the cloudflare account"
}
variable "cloudflare_token" {
    description = "API Token of the cloudflare account"
}

# -----------------------------------------------------
# Github Information
# -----------------------------------------------------

variable "github_token" {
    description = "The github oauth token"
}

variable "github_organization" {
    description = "Organization that the repo belongs to"
}

variable "github_repo" {
    description = "Repo name"
}

# -----------------------------------------------------
# Misc
# -----------------------------------------------------
variable "app_domain" {
    description = "Domain Name this app is running on"
}

variable "app_subdomain" {
    description = "Subdomain Name this app is running on"
}

variable "ecr_repository" {
    description = "ECR Repository Name"
}

variable "mongo_url" {
    description = "The Mongo URL for the configuration DB"
}

variable "from_email" {
    description = "The email that messages are sent from"
}

# -----------------------------------------------------
# Autoscaling
# -----------------------------------------------------
# The minimum number of containers that should be running.
# Must be at least 1.
# used by both autoscale-perf.tf and autoscale.time.tf
# For production, consider using at least "2".
variable "ecs_autoscale_min_instances" {
    default = "1"
}

# The maximum number of containers that should be running.
# used by both autoscale-perf.tf and autoscale.time.tf
variable "ecs_autoscale_max_instances" {
    default = "8"
}

# If the average CPU utilization over a minute drops to this threshold,
# the number of containers will be reduced (but not below ecs_autoscale_min_instances).
variable "ecs_as_cpu_low_threshold_per" {
    default = "20"
}

# If the average CPU utilization over a minute rises to this threshold,
# the number of containers will be increased (but not above ecs_autoscale_max_instances).
variable "ecs_as_cpu_high_threshold_per" {
    default = "80"
}

# -----------------------------------------------------
# Zeit
# -----------------------------------------------------
variable "zeit_token" {
    description = "Zeit API Token"
}
variable "zeit_client_id" {
    description = "Unused"
    default = ""
}
variable "zeit_client_secret" {
    description = "Unused"
    default = ""
}
