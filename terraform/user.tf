# Policy
data "aws_iam_policy_document" "secrets" {
    // Secrets Management
    statement {
        actions = [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret"
        ]
        effect  = "Allow"

        resources = [
            aws_secretsmanager_secret.zeit.arn,
            aws_secretsmanager_secret.database.arn
        ]
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

data "aws_iam_policy_document" "cloudwatch" {
    // Secrets Management
    statement {
        sid = "1"
        actions = [
            "logs:PutRetentionPolicy",
            "logs:DescribeLogStreams",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
        ]
        effect  = "Allow"

        resources = [
            "arn:aws:logs:us-east-1:*:log-group:/rabbitnowforwarder/*",
            "arn:aws:logs:us-east-1:*:log-group:/rabbitnowforwarder/*:log-stream",
            "arn:aws:logs:us-east-1:*:log-group:/rabbitnowforwarder/*:log-stream:",
            "arn:aws:logs:us-east-1:*:log-group:/rabbitnowforwarder/*:log-stream:*",
            "arn:aws:logs:us-east-1:*:log-group:/rabbitnowforwarder/*:*:*"
        ]
    }

    statement {
        sid     = "2"
        actions = [
            "logs:CreateLogGroup"
        ]
        effect  = "Allow"

        resources = ["*"]
    }
}

data "aws_iam_policy_document" "ses" {
    // Systems Management
    statement {
        actions   = [
            "ses:SendEmail",
        ]
        effect    = "Allow"
        resources = ["*"]
    }
}

# User
resource "aws_iam_user" "_" {
    name = "rabbitmq-now-forwarder"

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
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

resource "aws_iam_user_policy" "cloudwatch" {
    name   = "cloudwatch"
    user   = aws_iam_user._.name
    policy = data.aws_iam_policy_document.cloudwatch.json
}

resource "aws_iam_user_policy" "ses" {
    name   = "resource_groups"
    user   = aws_iam_user._.name
    policy = data.aws_iam_policy_document.ses.json
}
