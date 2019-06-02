resource "aws_appautoscaling_target" "app_scale_target" {
    service_namespace  = "ecs"
    resource_id        = "service/${aws_ecs_cluster._.name}/${aws_ecs_service._.name}"
    scalable_dimension = "ecs:service:DesiredCount"
    max_capacity       = var.ecs_autoscale_max_instances
    min_capacity       = var.ecs_autoscale_min_instances
}

resource "aws_appautoscaling_policy" "app_up" {
    name               = "rnf-scale-up"
    service_namespace  = aws_appautoscaling_target.app_scale_target.service_namespace
    resource_id        = aws_appautoscaling_target.app_scale_target.resource_id
    scalable_dimension = aws_appautoscaling_target.app_scale_target.scalable_dimension

    step_scaling_policy_configuration {
        adjustment_type         = "ChangeInCapacity"
        cooldown                = 60
        metric_aggregation_type = "Average"

        step_adjustment {
            metric_interval_lower_bound = 0
            scaling_adjustment          = 1
        }
    }
}

resource "aws_appautoscaling_policy" "app_down" {
    name               = "rnf-scale-down"
    service_namespace  = aws_appautoscaling_target.app_scale_target.service_namespace
    resource_id        = aws_appautoscaling_target.app_scale_target.resource_id
    scalable_dimension = aws_appautoscaling_target.app_scale_target.scalable_dimension

    step_scaling_policy_configuration {
        adjustment_type         = "ChangeInCapacity"
        cooldown                = 300
        metric_aggregation_type = "Average"

        step_adjustment {
            metric_interval_upper_bound = 0
            scaling_adjustment          = -1
        }
    }
}
