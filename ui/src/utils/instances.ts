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

    for (let i = 0; i < metadata.instances.length; i++) {
        const instance = metadata.instances[i];

        if (instance.id === instanceId) {
            metadata.instances[i].listeners.push(listener);
            break;
        }
    }

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

export async function getInstances(handler: HandlerOptions) {
    const {zeitClient} = handler;
    const metadata: nowMetadata = await zeitClient.getMetadata();

    if (!metadata.instances) {
        return [];
    }

    return metadata.instances;
}
