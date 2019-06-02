# -----------------------------------------------------
# AWS
# -----------------------------------------------------
provider "aws" {
    region                  = var.aws_region
    shared_credentials_file = var.aws_shared_credentials_file
    profile                 = var.aws_profile
}

# -----------------------------------------------------
# Cloudflare
# -----------------------------------------------------
provider "cloudflare" {
    email = var.cloudflare_email
    token = var.cloudflare_token
}

# -----------------------------------------------------
# Github
# -----------------------------------------------------
provider "github" {
    token = var.github_token
    organization = var.github_organization
}
