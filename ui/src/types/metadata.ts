export interface metadataListener {
    id: string;
    enabled: boolean;
    queue: string;
    endpoint: string;
    expected_status_code?: number;
    retry_on_failure: boolean;
}

export interface metadataInstance {
    id: string;
    name: string;
    connection: {
        host: string;
        port: string;
        vhost?: string;
        username: string;
        password: string;
    };
    listeners: metadataListener[];
}

export interface metadataPreferences {
    email_notifications: boolean;
}

export default interface nowMetadata {
    linked?: {[projectId: string]: boolean}
    public_key: string;
    instances: metadataInstance[];
    preferences: metadataPreferences;
}
