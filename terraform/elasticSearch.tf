variable "elastic_instance_count" {
    default = 1
}

module "elastic-search-logger" {
    source                         = "git@github.com:discordservers/terraform-modules.git//modules/elastic-search-logger"
    cloudwatch_log_group_name      = aws_cloudwatch_log_group.rabbitnowforwarder.name
    elasticsearch_domain           = aws_cloudwatch_log_group.rabbitnowforwarder.name
    kibana_whitelisted_cidr_blocks = ["83.83.190.106", "76.167.226.42"]

    elasticsearch_instance_count = var.elastic_instance_count

    tags = {
        App = "RNF"
    }
}

output "elasticsearch_endpoint" {
    value = module.elastic-search-logger.endpoint
}

output "kibana_endpoint" {
    value = module.elastic-search-logger.kibana_endpoint
}
