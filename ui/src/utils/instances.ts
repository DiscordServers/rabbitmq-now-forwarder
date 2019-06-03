import {HandlerOptions} from '@zeit/integration-utils';
import fetch from 'node-fetch';
import {instanceOptions} from '../types/instance';
import nowMetadata, {metadataInstance} from '../types/metadata';

const uuid = require('uuid/v4');

export async function toggleListener(instanceId: string, listenerId: string, handler: HandlerOptions) {
    const {zeitClient} = handler;
    const metadata: nowMetadata = await zeitClient.getMetadata();

    const instance = metadata.instances
        .find((instance) => instance.id === instanceId)
        .listeners.find((listener) => listener.id === listenerId);

    instance.enabled = !instance.enabled;

    await zeitClient.setMetadata(metadata);
}

export async function addListener(
    instanceId: string,
    options: {
        endpoint: string;
        queue: string;
        retry_on_failure: boolean;
        expected_status_code?: number;
    },
    handler: HandlerOptions,
) {
    if (!options.endpoint) {
        throw new Error('Missing endpoint');
    }
    if (!options.queue) {
        throw new Error('Missing queue');
    }

    const {zeitClient} = handler;
    let metadata: nowMetadata = await zeitClient.getMetadata();

    const listener = {
        id: uuid(),
        enabled: true,
        endpoint: options.endpoint,
        queue: options.queue,
        retry_on_failure: options.retry_on_failure,
        expected_status_code: options.expected_status_code,
    };

    const instanceIndex = metadata.instances.findIndex((instance) => {
        return instance.id === instanceId;
    });
    metadata.instances[instanceIndex].listeners.push(listener);

    await zeitClient.setMetadata(metadata);
    return;
}

export async function deleteListener(instanceId: string, listenerIndex: string, handler: HandlerOptions) {
    const {zeitClient} = handler;
    let metadata: nowMetadata = await zeitClient.getMetadata();

    const instanceIndex = metadata.instances.findIndex((instance) => {
        return instance.id === instanceId;
    });
    metadata.instances[instanceIndex].listeners.splice(parseInt(listenerIndex), 1);

    await zeitClient.setMetadata(metadata);
    return;
}

export async function updateInstance(instanceId: string, instanceOptions: instanceOptions, handler: HandlerOptions) {
    const {zeitClient} = handler;

    const metadata: nowMetadata = await zeitClient.getMetadata();
    const instance = metadata.instances.find((instance) => instance.id === instanceId);
    const {connection} = instance;

    instance.name = instanceOptions.name;
    connection.host = instanceOptions.host;
    connection.port = instanceOptions.port;
    connection.vhost = instanceOptions.vhost;
    connection.username = instanceOptions.username;
    connection.password = instanceOptions.password;

    await zeitClient.setMetadata(metadata);
    return;
}

export async function addInstance(instanceOptions: instanceOptions, handler: HandlerOptions) {
    ['name', 'host', 'port', 'username', 'password'].forEach((key) => {
        if (!instanceOptions[key]) {
            throw new Error(`Missing ${key}`);
        }
    });

    const {zeitClient} = handler;

    let metadata: nowMetadata = await zeitClient.getMetadata();
    if (!metadata.instances) {
        metadata.instances = [];
    }

    const instanceId = uuid();
    const instance: instanceOptions = {
        host: instanceOptions.host,
        port: instanceOptions.port,
        username: instanceOptions.username,
        password: instanceOptions.password,
        vhost: instanceOptions.vhost || '/',
    };

    const metadataInstance: metadataInstance = {
        id: instanceId,
        name: instanceOptions.name,
        connection: instance,
        listeners: [],
    };

    metadata.instances.push(metadataInstance);
    metadata.public_key = await getGeneratedKey(handler.payload.configurationId);

    await zeitClient.setMetadata(metadata);

    return metadataInstance;
}

export async function getGeneratedKey(configurationId: string): Promise<string> {
    const response = await fetch(`${process.env.ZEIT_HOOK_URL}/getPublicKey/${configurationId}`);

    return response.text();
}

export async function regenerateKey(configurationId: string, handler: HandlerOptions): Promise<string> {
    const response = await fetch(
        `${process.env.ZEIT_HOOK_URL}/regenerateKey/${configurationId}`,
        {
            method: 'POST',
            headers: {
                Authorization: 'Bearer ' + handler.payload.token
            }
        }
    );

    let metadata: nowMetadata = await handler.zeitClient.getMetadata();
    metadata.public_key = await response.text();

    await handler.zeitClient.setMetadata(metadata);

    return metadata.public_key;
}

export async function deleteInstance(instanceId: string, handler: HandlerOptions) {
    const {zeitClient} = handler;
    const metadata: nowMetadata = await zeitClient.getMetadata();

    const instanceIndex = metadata.instances.findIndex((instance) => instance.id === instanceId);

    metadata.instances.splice(instanceIndex, 1);
    await zeitClient.setMetadata(metadata);
    return;
}

export async function getInstances(handler: HandlerOptions) {
    const {zeitClient} = handler;
    const metadata: nowMetadata = await zeitClient.getMetadata();

    if (!metadata.instances) {
        return [];
    }

    return metadata.instances;
}

export async function getInstance(instanceId: string, handler: HandlerOptions) {
    const {zeitClient} = handler;
    const metadata: nowMetadata = await zeitClient.getMetadata();

    return metadata.instances.find((instance) => instance.id === instanceId);
}
