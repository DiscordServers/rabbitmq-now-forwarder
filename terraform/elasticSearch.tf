variable "elastic_instance_count" {
    default = 1
}

module "elastic-search-logger" {
    source                         = "git@github.com:discordservers/terraform-modules.git//modules/elastic-search-logger"
    cloudwatch_log_group_name      = aws_cloudwatch_log_group.rabbitnowforwarder.name
    elasticsearch_domain           = aws_cloudwatch_log_group.rabbitnowforwarder.name
    kibana_whitelisted_cidr_blocks = ["0.0.0.0/32"]

    elasticsearch_vpc_id         = data.aws_vpc.default.id
    elasticsearch_subnet_ids     = chunklist(data.aws_subnet_ids._.ids, var.elastic_instance_count)[0]
    elasticsearch_instance_count = var.elastic_instance_count

    tags = {
        App = "RNF"
    }
}


data "aws_vpc" "default_vpc" {
    default = true
}

data "aws_subnet_ids" "default_subnets" {
    vpc_id = data.aws_vpc.default_vpc.id
}
