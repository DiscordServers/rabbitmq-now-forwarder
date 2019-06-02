export interface metadataListener {
    queue: string;
    endpoint: string;
}

export interface metadataInstance {
    id: string;
    name: string;
    connection_secret: string;
    // private_key_secret: string;
    // public_key: string;
    listeners: metadataListener[];
}

export default interface nowMetadata {
    instances: metadataInstance[];
}
