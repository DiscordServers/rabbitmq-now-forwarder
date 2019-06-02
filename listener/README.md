# RabbitMQ Now Forwarder - Listener 

### Basics:

1. Start up
    1. Connect with AWS Secrets Manager
    2. Get secrets for talking to the Zeit API
    3. Grab manifests from Zeit
    4. Start a configurable amount of listeners
        * Spawn up listeners for the user integrations until CPU is at 85%?
        * Record somewhere (db? Manifests from zeit?) that this listener is running, and the last heartbeat, should record every few seconds
        * New instances of the listener should grab user integrations that havent been running for > 1 minute 
    5. On message, sign it, and send it off to the endpoint
