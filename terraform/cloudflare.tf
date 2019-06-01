resource "cloudflare_record" "auth" {
    domain  = var.app_domain
    name    = "rnf"
    type    = "CNAME"
    value   = "alias.zeit.co"
    proxied = true
}

resource "cloudflare_page_rule" "acme-challenge" {
    zone = var.app_domain
    target = "http://${var.app_subdomain}.${var.app_domain}/.well-known/acme-challenge"
    actions {
        always_use_https = false
        disable_apps = true
        disable_performance = true
        disable_security = true
        ssl = "off"
    }
}
