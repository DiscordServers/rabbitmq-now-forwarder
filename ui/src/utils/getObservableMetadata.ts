import {HandlerOptions} from '@zeit/integration-utils/lib';
import objectPath from 'object-path';
import onChange from 'on-change';

import Metadata, {InstanceInterface, ListenerInterface} from '../types/Metadata';

const getObjectPath = (metadata: Metadata, path: string, backTrack: boolean = false) => {
    return objectPath.get(metadata, backTrack ? path.substr(0, path.lastIndexOf('.')) : path);
};

const getDefaultMetadata = (): Metadata => {
    return {
        isSetUp:     false,
        linked:      {},
        instances:   [],
        publicKey:   null,
        preferences: {
            emailNotifications: false,
            lastUpdate:         Date.now(),
        },
        lastUpdate:  Date.now(),
    };
};

const getObservableMetadata = async ({zeitClient}: HandlerOptions): Promise<Metadata> => {
    let metadata: Metadata = await zeitClient.getMetadata();
    if (!metadata) {
        metadata = getDefaultMetadata();

        await metadata.save();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const observableMetadata: Metadata = onChange(metadata as any, (path) => {
        if (/lastUpdate$/.test(path)) {
            return;
        }

        // Updating the lastUpdate date of the instance, if there was a change to it or its children
        let match = path.match(/^instances\.\d+/);
        if (match !== null) {
            const instance: InstanceInterface = getObjectPath(metadata, match[0]);
            instance.lastUpdate               = Date.now();
        }

        // Updating the lastUpdate date of the listener, if there was a change to it or its children
        match = path.match(/^instances\.\d+\.listeners\.\d+/);
        if (match !== null) {
            const listener: ListenerInterface = getObjectPath(metadata, match[0]);
            listener.lastUpdate               = Date.now();
        }

        // Updating the lastUpdate date of the preferences, if there was a change to anything on its path
        if (/^preferences/.test(path)) {
            metadata.preferences.lastUpdate = Date.now();
        }

        metadata.lastUpdate = Date.now();
    });

    Object.defineProperty(observableMetadata, 'save', async () => zeitClient.setMetadata(observableMetadata));

    return observableMetadata;
};

export default getObservableMetadata;
