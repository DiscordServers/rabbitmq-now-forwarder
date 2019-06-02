resource "aws_secretsmanager_secret" "zeit" {
	name                    = "discordservers/rnf/zeit"
	recovery_window_in_days = 0

	tags = {
		Terraform = "true"
		App       = "RNF"
	}
}

locals {
	zeit = {
		clientId     = ""
		clientSecret = ""
	}
}

resource "aws_secretsmanager_secret_version" "zeit" {
	secret_id     = aws_secretsmanager_secret.zeit.id
	secret_string = jsonencode(local.zeit)
}
