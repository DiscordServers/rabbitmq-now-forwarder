import {htm, withUiHook} from '@zeit/integration-utils';
import createPage from './create';
import nowMetadata from './types/metadata';
import {getInstances} from './utils/instances';
import {inspect} from 'util';

export default withUiHook(async (handler) => {
    const {payload, zeitClient} = handler;

    const metadata: nowMetadata = await zeitClient.getMetadata();
    console.log(payload, metadata);

    if (['add-instance', 'submit-instance'].includes(payload.action)) {
        return createPage(handler);
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
                <UL>
                    ${instances.map((instance) => {
                        return htm`
                            <LI>
                                <Button small>${instance.name}</Button>
                            </LI>
                        `;
                    })}
                </UL>
            </Box>
        </Page>
    `;
});
