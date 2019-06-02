export interface Listener {
    queue: string;
    endpoint: string;
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

export default interface Metadata {
    instances: Instance[];
    error?: any;
}
