import {HandlerOptions} from '@zeit/integration-utils/lib';
import uuid from 'uuid/v4';

import {ListenerInterface} from '../types/Metadata';

import getObservableMetadata from './getObservableMetadata';

interface ListenerOptionsInterface {
    endpoint: string;
    queue: string;
    retryOnFailure: boolean;
    expectedStatusCode?: number;
}

export async function toggleListener(instanceId: string, listenerId: string, handler: HandlerOptions) {
    const metadata = await getObservableMetadata(handler);

    const instance = metadata.instances.find((instance) => instance.id === instanceId);
    const listener = instance.listeners.find((listener) => listener.id === listenerId);

    listener.enabled = !listener.enabled;

    return metadata.save();
}

export async function addListener(instanceId: string, options: ListenerOptionsInterface, handler: HandlerOptions) {
    if (!options.endpoint) {
        throw new Error('Missing endpoint');
    }
    if (!options.queue) {
        throw new Error('Missing queue');
    }
    const metadata = await getObservableMetadata(handler);

    const listener: ListenerInterface = {
        id:                 uuid(),
        enabled:            true,
        endpoint:           options.endpoint,
        queue:              options.queue,
        retryOnFailure:     options.retryOnFailure,
        expectedStatusCode: options.expectedStatusCode,
        lastUpdate:         Date.now(),
    };

    metadata.instances
        .find((instance) => instance.id === instanceId)
        .listeners.push(listener);

    return metadata.save();
}

export async function deleteListener(instanceId: string, listenerIndex: string, handler: HandlerOptions) {
    const metadata = await getObservableMetadata(handler);

    metadata.instances
        .find((instance) => instance.id === instanceId)
        .listeners.splice(parseInt(listenerIndex), 1);

    return metadata.save();
}
