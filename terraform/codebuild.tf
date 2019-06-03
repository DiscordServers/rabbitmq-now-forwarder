resource "aws_s3_bucket" "_" {
    bucket = "rnf-codebuild"
    acl    = "private"
    tags   = {
        Terraform = "true"
        App       = "RNF"
    }
}

# -----------------------------------------------------
# AWS IAM role for the codebuild process
# -----------------------------------------------------
resource "aws_iam_role" "_" {
    name               = "rnf-codebuild"
    assume_role_policy = data.aws_iam_policy_document.assume.json
}

# -----------------------------------------------------
# Ensures that the IAM role above has access to the S3 bucket that codepipeline uses
# -----------------------------------------------------
data "aws_iam_policy_document" "s3" {
    statement {
        effect    = "Allow"
        actions   = ["s3:*"]
        resources = [aws_s3_bucket._.arn, "${aws_s3_bucket._.arn}/*"]
        sid       = ""
    }
}

# -----------------------------------------------------
# IAM Assume policy for the IAM role above
# -----------------------------------------------------
data "aws_iam_policy_document" "assume" {
    statement {
        effect  = "Allow"
        principals {
            identifiers = [
                "s3.amazonaws.com",
                "codepipeline.amazonaws.com",
                "codebuild.amazonaws.com",
                "ecs.amazonaws.com",
                "ecs-tasks.amazonaws.com",
            ]
            type        = "Service"
        }
        actions = ["sts:AssumeRole"]
        sid     = ""
    }
}

# -----------------------------------------------------
# Permissions to allow access to ecr, logs, ssm, and ecs
# -----------------------------------------------------
#data "aws_ecs_cluster" "_" {
#    cluster_name = "${var.ecs_cluster_name}"
#}

data "aws_iam_policy_document" "permissions" {
    statement {
        sid       = ""
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
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
            "ssm:GetParameters",
            "iam:PassRole",
            "ecs:*",
        ]
        effect    = "Allow"
        resources = ["*"]
    }
    # -----------------------------------------------------
    # @TODO lock down access to specific cluster
    # -----------------------------------------------------
    #statement {
    #    sid = ""
    #    effect = "Allow"
    #    actions = [
    #        "ecs:*"
    #    ],
    #    resources = ["${data.aws_ecs_cluster._.arn}"]
    #}
}

# -----------------------------------------------------
# IAM Policy to allow access to ecr, logs and ssm for /service-role/ in the IAM role
# -----------------------------------------------------
resource "aws_iam_policy" "_" {
    name   = "rnf-codebuild"
    policy = data.aws_iam_policy_document.permissions.json
}

resource "aws_iam_policy" "codebuild" {
    name   = "rnf-codebuild-sr"
    path   = "/service-role/"
    policy = data.aws_iam_policy_document.permissions.json
}

resource "aws_iam_role_policy_attachment" "_" {
    role       = aws_iam_role._.id
    policy_arn = aws_iam_policy.codebuild.arn
}

resource "aws_iam_role_policy" "_" {
    role   = aws_iam_role._.id
    policy = data.aws_iam_policy_document.s3.json
}

data "aws_iam_policy_document" "codebuild" {
    statement {
        effect    = "Allow"
        actions   = ["codebuild:*"]
        resources = ["${aws_codebuild_project._.id}"]
        sid       = ""
    }
}

resource "aws_iam_role_policy" "codebuild" {
    role   = aws_iam_role._.id
    policy = data.aws_iam_policy_document.codebuild.json
}

resource "aws_codebuild_project" "_" {
    name         = "rnf"
    service_role = aws_iam_role._.arn

    artifacts {
        type = "CODEPIPELINE"
    }

    environment {
        compute_type    = "BUILD_GENERAL1_SMALL"
        image           = "aws/codebuild/docker:17.09.0"
        type            = "LINUX_CONTAINER"
        privileged_mode = "true"

        environment_variable {
            name  = "REPO_URL"
            value = aws_ecr_repository._.repository_url
        }

        environment_variable {
            name  = "BRANCH"
            value = "master"
        }
    }

    source {
        buildspec = file("${path.module}/buildspecs/master.yml")
        type      = "CODEPIPELINE"
    }
}

resource "aws_codepipeline" "source_build_deploy" {
    name     = "rnf"
    role_arn = aws_iam_role._.arn

    artifact_store {
        location = aws_s3_bucket._.bucket
        type     = "S3"
    }

    stage {
        name = "Source"

        action {
            name             = "Source"
            category         = "Source"
            owner            = "ThirdParty"
            provider         = "GitHub"
            version          = "1"
            output_artifacts = ["code"]

            configuration = {
                Owner      = var.github_organization
                Repo       = var.github_repo
                OAuthToken = var.github_token
                Branch     = "master"
            }
        }
    }

    stage {
        name = "Build"

        action {
            name      = "Build"
            category  = "Build"
            owner     = "AWS"
            provider  = "CodeBuild"
            version   = "1"
            run_order = 1

            input_artifacts  = ["code"]
            output_artifacts = ["task"]

            configuration = {
                ProjectName = aws_codebuild_project._.name
            }
        }
    }

    stage {
        name = "Deploy"

        action {
            name            = "Deploy"
            category        = "Deploy"
            owner           = "AWS"
            provider        = "ECS"
            version         = "1"
            run_order       = 1
            input_artifacts = ["task"]

            configuration = {
                ClusterName = aws_ecs_cluster._.name
                ServiceName = aws_ecs_service._.name
            }
        }
    }

    lifecycle {
        ignore_changes = ["stage[0]"]
    }
}

resource "aws_codepipeline_webhook" "_" {
    name            = "rnf-webhook"
    authentication  = "GITHUB_HMAC"
    target_action   = "Source"
    target_pipeline = aws_codepipeline.source_build_deploy.name

    authentication_configuration {
        secret_token = md5("rnf-master")
    }

    filter {
        json_path    = "$.ref"
        match_equals = "refs/heads/master"
    }
}

resource "github_repository_webhook" "_" {
    repository = var.github_repo
    events     = ["push"]
    configuration {
        url          = aws_codepipeline_webhook._.url
        content_type = "form"
        insecure_ssl = "true"
        secret       = md5("rnf-master")
    }
}
