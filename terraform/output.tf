output "sm_access_key_id" {
    value = aws_iam_access_key._.id
}
output "sm_secret_access_key" {
    value = aws_iam_access_key._.secret
}

locals {
    env = <<EOF
sm_access_key_id = "${aws_iam_access_key._.id}"
sm_secret_access_key = "${aws_iam_access_key._.secret}"
EOF
}

resource "local_file" "env" {
    filename = "${path.module}/../.env"
    content  = local.env
}
