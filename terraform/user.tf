# Policy
data "aws_iam_policy_document" "_" {
    // Secrets Management
    statement {
        sid = "secrets"
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

    // Logs
    statement {
        sid     = "cwg"
        actions = [
            "logs:CreateLogGroup"
        ]
        effect  = "Allow"

        resources = ["*"]
    }
    statement {
        sid = "cws"
        actions = [
            "logs:PutRetentionPolicy",
            "logs:DescribeLogStreams",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
        ]
        effect  = "Allow"

        resources = [
            "arn:aws:logs:*:*:log-group:rabbitnowforwarder",
            "arn:aws:logs:*:*:log-group:rabbitnowforwarder:*:*"
        ]
    }

    // Sending Emails
    statement {
        sid       = "ses"
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

resource "aws_iam_user_policy" "_" {
    user   = aws_iam_user._.name
    policy = data.aws_iam_policy_document._.json
}
