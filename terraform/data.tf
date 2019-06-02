data "aws_vpc" "default" {}

data "aws_subnet_ids" "_" {
    vpc_id = data.aws_vpc.default.id
}
