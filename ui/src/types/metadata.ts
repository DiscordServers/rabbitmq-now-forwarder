export interface metadataListener {
    queue: string;
    endpoint: string;
}

export interface metadataInstance {
    id: string;
    name: string;
    connection_secret: string;
    keys_secret: string;
    listeners: metadataListener[];
}

export default interface nowMetadata {
    instances: metadataInstance[];
}
