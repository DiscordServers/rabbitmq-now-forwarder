resource "aws_ecr_repository" "_" {
    name = var.ecr_repository
}

data "template_file" "task_definition-service" {
    template = file("task-definitions/service.json")

    vars = {
        "image"                = "${aws_ecr_repository._.repository_url}:master"
        "mongo_url_secret_arn" = aws_secretsmanager_secret_version.database.arn
        "from_email"           = var.from_email
        "access_key_id"        = aws_iam_access_key._.id
        "secret_access_key"    = aws_iam_access_key._.secret
    }
}

resource "aws_ecs_task_definition" "_" {
    family                = "rabbitmq-now-forwarder-listener"
    container_definitions = data.template_file.task_definition-service.rendered
    execution_role_arn    = aws_iam_role.service_role.arn

    network_mode = "awsvpc"

    requires_compatibilities = ["FARGATE"]
    cpu                      = 512
    memory                   = 1024

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
}

resource "aws_ecs_cluster" "_" {
    name = "rabbitmq-now-forwarder"

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
}

resource "aws_security_group" "_" {
    name_prefix = "rnf_ecs_"
    vpc_id      = data.aws_vpc.default.id

    egress {
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }

    lifecycle {
        create_before_destroy = true
    }

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
}

resource "aws_ecs_service" "_" {
    name            = "listener"
    cluster         = aws_ecs_cluster._.id
    task_definition = aws_ecs_task_definition._.arn
    desired_count   = 1
    launch_type     = "FARGATE"

    network_configuration {
        subnets          = data.aws_subnet_ids._.ids
        security_groups  = [aws_security_group._.id]
        assign_public_ip = true
    }

    lifecycle {
        ignore_changes = ["desired_count", "task_definition"]
    }
}

resource "aws_iam_role" "service_role" {
    name               = "rnf-ecs-service-role"
    assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
}

data "aws_iam_policy_document" "assume_role_policy" {
    statement {
        actions = ["sts:AssumeRole"]
        effect  = "Allow"

        principals {
            type        = "Service"
            identifiers = ["ecs.amazonaws.com", "ecs-tasks.amazonaws.com"]
        }
    }
}

resource "aws_iam_role_policy_attachment" "service_role_policy" {
    role       = aws_iam_role.service_role.id
    policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

data "aws_iam_policy_document" "ecs_task_role" {
    statement {
        sid       = "1"
        effect    = "Allow"
        actions   = [
            "ecr:GetAuthorizationToken",
            "ecr:BatchCheckLayerAvailability",
            "ecr:GetDownloadUrlForLayer",
            "ecr:CompleteLayerUpload",
            "ecr:GetRepositoryPolicy",
            "ecr:InitiateLayerUpload",
            "ecr:PutImage",
            "ecr:UploadLayerPart",
            "ecr:DescribeRepositories",
            "ecr:ListImages",
            "ecr:DescribeImages",
            "ecr:BatchGetImage",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
            "elasticloadbalancing:*",
        ]
        resources = ["*"]
    }

    statement {
        sid       = "2"
        effect    = "Allow"
        actions   = [
            "secretsmanager:GetSecretValue",
            "secretsmanager:DescribeSecret"
        ]
        resources = [aws_secretsmanager_secret.database.arn]
    }
}

resource "aws_iam_role_policy" "service_role_task_policy" {
    name   = "${aws_iam_role.service_role.name}_task_policy"
    role   = aws_iam_role.service_role.id
    policy = data.aws_iam_policy_document.ecs_task_role.json
}

resource "aws_cloudwatch_log_group" "logs" {
    name              = "/ecs/rabbitmq-now-forwarder"
    retention_in_days = "14"
    tags              = {
        Terraform = "true"
        App       = "RNF"
    }
}
