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
# Misc
# -----------------------------------------------------
variable "app_domain" {
    description = "Domain Name this app is running on"
}
variable "app_subdomain" {
    description = "Subdomain Name this app is running on"
}
