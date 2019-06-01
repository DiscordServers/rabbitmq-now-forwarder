# Policy
data "aws_iam_policy_document" "secrets" {
    // Secrets Management
    statement {
        actions = [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret"
        ]
        effect  = "Allow"

        resources = [aws_secretsmanager_secret.zeit.arn]
    }
}

data "aws_iam_policy_document" "resource_groups" {
    // Systems Management
    statement {
        actions   = [
            "resource-groups:*",
            "tag:*"
        ]
        effect    = "Allow"
        resources = ["*"]
    }
}

# User
resource "aws_iam_user" "_" {
    name = "rabbitmq-now-forwarder"
}

resource "aws_iam_access_key" "_" {
    user = aws_iam_user._.name
}

resource "aws_iam_user_policy" "secrets" {
    name   = "secrets_manager"
    user   = aws_iam_user._.name
    policy = data.aws_iam_policy_document.secrets.json
}

resource "aws_iam_user_policy" "resource_groups" {
    name   = "resource_groups"
    user   = aws_iam_user._.name
    policy = data.aws_iam_policy_document.resource_groups.json
}
