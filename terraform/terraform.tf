terraform {
    backend "remote" {
        hostname = "app.terraform.io"
        organization = "discordservers"
        workspaces {
            name = "rabbitmq-now-forwarder"
        }
    }
}
