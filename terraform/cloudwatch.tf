resource "aws_cloudwatch_metric_alarm" "cpu_utilization_high" {
    alarm_name          = "rnf-CPU-Utilization-High-${var.ecs_as_cpu_high_threshold_per}"
    comparison_operator = "GreaterThanOrEqualToThreshold"
    evaluation_periods  = "1"
    metric_name         = "CPUUtilization"
    namespace           = "AWS/ECS"
    period              = "60"
    statistic           = "Average"
    threshold           = "${var.ecs_as_cpu_high_threshold_per}"

    dimensions = {
        ClusterName = aws_ecs_cluster._.name
        ServiceName = aws_ecs_service._.name
    }

    alarm_actions = [aws_appautoscaling_policy.app_up.arn]

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
}

resource "aws_cloudwatch_metric_alarm" "cpu_utilization_low" {
    alarm_name          = "rnf-CPU-Utilization-Low-${var.ecs_as_cpu_low_threshold_per}"
    comparison_operator = "LessThanThreshold"
    evaluation_periods  = "1"
    metric_name         = "CPUUtilization"
    namespace           = "AWS/ECS"
    period              = "60"
    statistic           = "Average"
    threshold           = "${var.ecs_as_cpu_low_threshold_per}"

    dimensions = {
        ClusterName = aws_ecs_cluster._.name
        ServiceName = aws_ecs_service._.name
    }

    alarm_actions = [aws_appautoscaling_policy.app_down.arn]

    tags = {
        Terraform = "true"
        App       = "RNF"
    }
}

resource "aws_cloudwatch_log_group" "rabbitnowforwarder" {
    name              = "rabbitnowforwarder"
    retention_in_days = 30
    tags              = {
        Terraform = "true"
        App       = "RNF"
    }
}
