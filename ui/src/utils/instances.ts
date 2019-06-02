import {HandlerOptions} from '@zeit/integration-utils';
import {instanceOptions} from '../types/instance';
import nowMetadata, {metadataInstance} from '../types/metadata';
import {generateKeys} from './generateKeys';

const uuid = require('uuid/v4');

export async function addListener(
    instanceId: string,
    endpoint: string,
    queue: string,
    handler: HandlerOptions,
) {
    if (!endpoint) {
        throw new Error('Missing endpoint');
    }
    if (!queue) {
        throw new Error('Missing queue');
    }

    const {zeitClient} = handler;
    let metadata: nowMetadata = await zeitClient.getMetadata();

    const listener = {
        endpoint,
        queue,
    };

    const instanceIndex = metadata.instances.findIndex((instance) => {
        return instance.id === instanceId;
    });
    metadata.instances[instanceIndex].listeners.push(listener);

    await zeitClient.setMetadata(metadata);
    return;
}

export async function deleteListener(
    instanceId: string,
    listenerIndex: string,
    handler: HandlerOptions,
) {
    const {zeitClient} = handler;
    let metadata: nowMetadata = await zeitClient.getMetadata();

    const instanceIndex = metadata.instances.findIndex((instance) => {
        return instance.id === instanceId;
    });
    metadata.instances[instanceIndex].listeners.splice(
        parseInt(listenerIndex),
        1,
    );

    await zeitClient.setMetadata(metadata);
    return;
}

export async function addInstance(
    instanceOptions: instanceOptions,
    handler: HandlerOptions,
) {
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
    };

    if (instanceOptions.vhost !== '') {
        instance.vhost = instanceOptions.vhost;
    }

    const connectionSecret = await zeitClient.ensureSecret(
        `instance-${instanceId}.connection`,
        JSON.stringify(instance),
    );
    const keysSecret = await zeitClient.ensureSecret(
        `instance-${instanceId}.keys`,
        JSON.stringify(await generateKeys()),
    );

    const metadataInstance: metadataInstance = {
        id: instanceId,
        name: instanceOptions.name,
        connection_secret: connectionSecret,
        keys_secret: keysSecret,
        listeners: [],
    };

    metadata.instances.push(metadataInstance);
    await zeitClient.setMetadata(metadata);

    return metadataInstance;
}

export async function deleteInstance(
    instanceId: string,
    handler: HandlerOptions,
) {
    const {zeitClient} = handler;
    const metadata: nowMetadata = await zeitClient.getMetadata();

    const instanceIndex = metadata.instances.findIndex(
        (instance) => instance.id === instanceId,
    );

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
