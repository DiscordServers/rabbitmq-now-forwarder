import {instance as instanceType} from '../types/instance';
import {HandlerOptions} from '@zeit/integration-utils';
import nowMetadata, {metadataInstance} from '../types/metadata';
const uuid = require('uuid/v4');

export async function addInstance(
    instanceOptions: instanceType,
    handler: HandlerOptions,
) {
    const {zeitClient} = handler;

    let metadata: nowMetadata = await zeitClient.getMetadata();
    if (!metadata.instances) {
        metadata = {
            instances: [],
        };
    }

    let metadataInstance: metadataInstance = {
        id: uuid(),
        name: instanceOptions.name,
    };

    metadata.instances.push(metadataInstance);
    await zeitClient.setMetadata(metadata);

    return metadataInstance;
}

export async function getInstances(handler: HandlerOptions) {
    const {zeitClient} = handler;
    const metadata: nowMetadata = await zeitClient.getMetadata();

    if (!metadata.instances) {
        return null;
    }

    return metadata.instances;
}
