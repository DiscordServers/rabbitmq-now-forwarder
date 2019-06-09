resource "cloudflare_record" "auth" {
    domain  = var.app_domain
    name    = var.app_subdomain
    type    = "CNAME"
    value   = "alias.zeit.co"
    proxied = true
}

resource "cloudflare_page_rule" "acme-challenge" {
    zone   = var.app_domain
    target = "http://${var.app_subdomain}.${var.app_domain}/.well-known/acme-challenge"
    priority = 1
    actions {
        always_use_https    = false
        disable_apps        = true
        disable_performance = true
        disable_security    = true
        ssl                 = "off"
    }
}


resource "cloudflare_record" "kibana" {
    domain  = var.app_domain
    name    = "${var.app_subdomain}-logs"
    type    = "CNAME"
    value   = module.elastic-search-logger.endpoint
    proxied = true
}

resource "cloudflare_page_rule" "kibana" {
    zone   = var.app_domain
    target = "https://${var.app_subdomain}-logs.${var.app_domain}/"
    priority = 2
    actions {
        forwarding_url {
            status_code = 301
            url         = "https://${module.elastic-search-logger.kibana_endpoint}"
        }
    }
}
