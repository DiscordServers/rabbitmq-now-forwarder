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
ZEIT_HOOK_URL = "http://localhost:3000"
COLLECTION = "dev"
TEST_PUBLIC_KEY = "LS0tLS1CRUdJTiBSU0EgUFVCTElDIEtFWS0tLS0tXG5NSUlCQ2dLQ0FRRUFvSExZL0s1QU51dEFTVmFjZG1oN2ppT0NPTE5qYW1RVEltVjhnZmhBYU9pYklyNGdQT0MwR0haVlJROStcbkM3V1JyQ01IQWtralFTSlJWQ21pWkRuSEpFVmdVejZpSnpRQm9rWW1NK2xIaFAzZXpNZ2tBQkgvb1JMcE5OUFV6STBYQmd2VFxuSFlreWtkdlF3Zy9nbnpOZGk2TERmZVROWmdaRmEwY0drN2c2WGh3ZjhKekZEQUdvdTNBckpEY1BZNlRrMkdZTUt3R3NoKzZZXG5VaGJycE41NGxNY3R2WnlSdnplVCswUlpDc3VNaTJ5VTUxZllSSUVkZGFQbU8vdm1tRkRiamlCbVo5VTZhWVRvM3Q2dWZjb1NcbmMxTnhNMlhmY05UU05ZemJ5ZkN6ejM1VkdrNVIyOUROdHJJQVlEQi9ZajJ2VlJSemI4RllGQmVIaXR0dURydUx1UUlEQVFBQlxuLS0tLS1FTkQgUlNBIFBVQkxJQyBLRVktLS0tLVxu"
FROM_EMAIL = "no-reply@rabbitnowforwarder.tech"
SES_ACCESS_KEY = "${aws_iam_access_key._.id}"
SES_ACCESS_SECRET = "${aws_iam_access_key._.secret}"
EOF
}

resource "local_file" "env" {
    filename = "${path.module}/../.env"
    content  = local.env
}
