import {HandlerOptions} from '@zeit/integration-utils';
import uuid from 'uuid/v4';

import {InstanceOptionsInterface} from '../types/instance';
import Metadata, {InstanceInterface} from '../types/Metadata';

import getObservableMetadata from './getObservableMetadata';
import {getGeneratedKey} from './keys';

export async function updateInstance(instanceId: string, instanceOptions: InstanceOptionsInterface, handler: HandlerOptions) {
    const metadata     = await getObservableMetadata(handler);

    const instance     = metadata.instances.find((instance) => instance.id === instanceId);
    const {connection} = instance;

    instance.name       = instanceOptions.name;
    connection.host     = instanceOptions.host;
    connection.port     = instanceOptions.port;
    connection.vhost    = instanceOptions.vhost;
    connection.username = instanceOptions.username;
    connection.password = instanceOptions.password;

    return metadata.save();
}

export async function addInstance(instanceOptions: InstanceOptionsInterface, handler: HandlerOptions) {
    ['name', 'host', 'port', 'username', 'password'].forEach((key) => {
        if (!instanceOptions[key]) {
            throw new Error(`Missing ${key}`);
        }
    });

    const metadata = await getObservableMetadata(handler);

    const instanceId                         = uuid();
    const instance: InstanceOptionsInterface = {
        host:     instanceOptions.host,
        port:     instanceOptions.port,
        username: instanceOptions.username,
        password: instanceOptions.password,
        vhost:    instanceOptions.vhost || '/',
    };

    const metadataInstance: InstanceInterface = {
        id:         instanceId,
        name:       instanceOptions.name,
        connection: instance,
        listeners:  [],
        lastUpdate: Date.now(),
    };

    metadata.instances.push(metadataInstance);
    metadata.publicKey  = await getGeneratedKey(handler.payload.configurationId);
    metadata.lastUpdate = Date.now();

    await metadata.save();

    return metadataInstance;
}

export async function deleteInstance(instanceId: string, handler: HandlerOptions) {
    const {zeitClient}       = handler;
    const metadata: Metadata = await zeitClient.getMetadata();

    const instanceIndex = metadata.instances.findIndex((instance) => instance.id === instanceId);

    metadata.instances.splice(instanceIndex, 1);
    metadata.lastUpdate = Date.now();

    await zeitClient.setMetadata(metadata);
    return;
}

export async function getInstances(handler: HandlerOptions) {
    const {zeitClient}       = handler;
    const metadata: Metadata = await zeitClient.getMetadata();

    if (!metadata.instances) {
        return [];
    }

    return metadata.instances;
}

export async function getInstance(instanceId: string, handler: HandlerOptions) {
    const {zeitClient}       = handler;
    const metadata: Metadata = await zeitClient.getMetadata();

    return metadata.instances.find((instance) => instance.id === instanceId);
}
