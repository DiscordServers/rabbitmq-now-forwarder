export interface Listener {
    id: string;
    queue: string;
    endpoint: string;
    expected_status_code?: number;
    retry_on_failure: boolean;
    enabled: boolean;
}

export interface Instance {
    id: string;
    name: string;
    connection: {
        host: string;
        port: string;
        vhost?: string;
        username: string;
        password: string;
    };
    public_key: string;
    listeners: Listener[];
}

export interface Preferences {
    email_notifications: boolean;
}

export default interface Metadata {
    instances: Instance[];
    preferences: Preferences;
    error?: any;
}
