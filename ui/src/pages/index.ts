import {htm, withUiHook} from '@zeit/integration-utils';
import nowMetadata from '../types/metadata';
import {deleteInstance, getGeneratedKey, getInstance, getInstances} from '../utils/instances';
import createPage from './create';
import viewInstance from './viewInstance';

function startsWithAny(search, ...strings) {
    for (const string of strings) {
        if (search.startsWith(string)) {
            return true;
        }
    }

    return false;
}

export default withUiHook(async (handler) => {
    const {payload, zeitClient} = handler;
    const {action} = payload;
    let notice: string | undefined;

    const metadata: nowMetadata = await zeitClient.getMetadata();
    const publicKey = await getGeneratedKey(payload.configurationId);
    console.log(payload, metadata, publicKey);

    switch (true) {
        case ['add-instance', 'submit-instance'].includes(action):
            return createPage(handler);
        case startsWithAny(action, 'submit-listener', 'update-instance', 'view-instance-', 'delete-listener-'):
            return viewInstance(handler);
        case action.startsWith('delete-instance'):
            const instanceId = action.substring('delete-instance-'.length);
            const instance = await getInstance(instanceId, handler);

            try {
                await deleteInstance(instanceId, handler);

                notice = htm`<Notice type="success">
                    Successfully deleted instance <B>${instance.name}</B> with ID <B>${instance.id}</B>
                </Notice>`;
            } catch (error) {
                notice = htm`<Notice type="error">
                    Failed deleting the instance for the following reason: <B>${error.message}</B>
                </Notice>`;
            }

            break;
    }

    // Return main screen by default
    payload.clientState = {};
    const instances = await getInstances(handler);

    return htm`
        <Page>
            <Box display="flex" justifyContent="space-between">
                <H1>Your Instances</H1>
                <Button action="add-instance">Add Instance</Button>
            </Box>

            <Box>
                ${notice ? htm`<Box padding="1rem">${notice}</Box>` : ''}
                <UL>
                    ${instances.map(
                        (instance) => htm`<LI>
                                <Button small action=${`view-instance-${instance.id}`}>${instance.name}</Button>
                                <Button small themeColor="red" action=${`delete-instance-${instance.id}`}>x</Button>
                            </LI>`,
                    )}
                </UL>
            </Box>
        </Page>
    `;
});
