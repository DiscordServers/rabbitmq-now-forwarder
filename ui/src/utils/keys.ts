import {HandlerOptions} from '@zeit/integration-utils/lib';
import fetch from 'node-fetch';

import Metadata from '../types/Metadata';

import manageLink from './manageLink';

export async function getGeneratedKey(configurationId: string): Promise<string> {
    const response = await fetch(`${process.env.ZEIT_HOOK_URL}/getPublicKey/${configurationId}`);

    return response.text();
}

export async function regenerateKey(configurationId: string, handler: HandlerOptions): Promise<string> {
    const response = await fetch(`${process.env.ZEIT_HOOK_URL}/regenerateKey/${configurationId}`, {
        method:  'POST',
        headers: {
            Authorization: 'Bearer ' + handler.payload.token,
        },
    });

    let metadata: Metadata = await handler.zeitClient.getMetadata();
    metadata.publicKey     = await response.text();
    metadata.lastUpdate    = Date.now();

    await handler.zeitClient.setMetadata(metadata);
    for (const projectId of Object.keys(metadata.linked)) {
        if (metadata.linked[projectId]) {
            await manageLink(handler, metadata, metadata.publicKey, 'link');
        }
    }

    return metadata.publicKey;
}
