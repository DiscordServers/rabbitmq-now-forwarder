import {HandlerOptions} from '@zeit/integration-utils/lib';
import nowMetadata from '../types/metadata';

type action = 'link' | 'unlink';

export default async function manageLink(
    handler: HandlerOptions,
    metadata: nowMetadata,
    publicKey: string,
    action: action,
) {
    const {payload, zeitClient} = handler;

    if (payload.projectId) {
        if (action === 'link') {
            const secretName = await zeitClient.ensureSecret('rabbit_forwarder_public_key', publicKey);
            await zeitClient.upsertEnv(payload.projectId, 'RABBIT_FORWARDER_PUBLIC_KEY', secretName);
        } else {
            await zeitClient.fetch('/v2/now/secrets/rabbit_forwarder_public_key', {method: 'DELETE'});
            await zeitClient.removeEnv(payload.projectId, 'RABBIT_FORWARDER_PUBLIC_KEY');
        }

        metadata.linked[payload.projectId] = action === 'link';
        await zeitClient.setMetadata(metadata);
    }
}
