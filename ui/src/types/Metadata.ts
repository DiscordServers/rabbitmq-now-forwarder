export interface ListenerInterface {
    id: string;
    enabled: boolean;
    queue: string;
    endpoint: string;
    expectedStatusCode?: number;
    retryOnFailure: boolean;
    lastUpdate?: number;
}

export interface InstanceInterface {
    id: string;
    name: string;
    connection: {
        host: string;
        port: string;
        vhost?: string;
        username: string;
        password: string;
    };
    listeners: ListenerInterface[];
    lastUpdate?: number;
}

export interface PreferencesInterface {
    emailNotifications: boolean;
    lastUpdate?: number;
}

export default interface Metadata {
    linked?: {[projectId: string]: boolean};
    publicKey: string;
    instances: InstanceInterface[];
    preferences: PreferencesInterface;
    isSetUp: boolean;
    lastUpdate?: number;

    save?(): Promise<void>;
}
