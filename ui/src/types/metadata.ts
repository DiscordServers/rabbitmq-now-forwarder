export interface metadataListener {
    queue: string;
    endpoint: string;
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
    public_key: string;
    listeners: metadataListener[];
}

export default interface nowMetadata {
    instances: metadataInstance[];
}
