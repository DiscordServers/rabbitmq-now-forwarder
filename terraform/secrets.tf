resource "aws_secretsmanager_secret" "zeit" {
    name                    = "discordservers/rnf/zeit"
    recovery_window_in_days = 0

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
}
resource "aws_secretsmanager_secret" "database" {
    name                    = "discordservers/rnf/database"
    recovery_window_in_days = 0

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
}

locals {
    zeit = {
        token        = var.zeit_token
        clientId     = var.zeit_client_id
        clientSecret = var.zeit_client_secret
    }
}

resource "aws_secretsmanager_secret_version" "zeit" {
    secret_id     = aws_secretsmanager_secret.zeit.id
    secret_string = jsonencode(local.zeit)
}

resource "aws_secretsmanager_secret_version" "database" {
    secret_id     = aws_secretsmanager_secret.database.id
    secret_string = var.mongo_url
}
