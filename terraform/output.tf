output "sm_access_key_id" {
    value = aws_iam_access_key._.id
}
output "sm_secret_access_key" {
    value = aws_iam_access_key._.secret
}

locals {
    env = <<EOF
MONGO_URL = "${var.mongo_url}"
ZEIT_CLIENT_ID = "${var.zeit_client_id}"
ZEIT_CLIENT_SECRET = "${var.zeit_client_secret}"
ZEIT_CLIENT_REDIRECT_URI = "http://localhost:3000/callback"
EOF
}

resource "local_file" "env" {
    filename = "${path.module}/../.env"
    content  = local.env
}
