import {htm, HandlerOptions} from '@zeit/integration-utils';
import { addInstance } from '../utils/instances';

let formStore = {
    instanceName: '',
    instanceHost: '',
    instancePort: '',
    instanceVhost: '',
    instanceUsername: '',
    instancePassword: '',
};

export default async function createPage(handler: HandlerOptions) {
    const {payload} = handler;
    const {action, clientState} = payload;
    let notice: string | undefined;

    if (action === 'submit-instance') {
        formStore = clientState;
        try {
            const newInstance = await addInstance(
                {
                    name: formStore.instanceName,
                    host: formStore.instanceHost,
                    port: formStore.instancePort,
                    vhost: formStore.instanceVhost,
                    username: formStore.instanceUsername,
                    password: formStore.instancePassword,
                },
                handler,
            );

            notice = htm`
                <Notice type="success">
                    Successfully added instance <B>${newInstance.name}</B> with ID <B>${newInstance.id}</B>
                </Notice>
            `
        } catch (error) {
            notice = htm`
                <Notice type="error">
                    Failed adding the instance for the following reason: <B>${error.message}</B>
                </Notice>
            `
        }
    }

    return htm`
        <Page>
            <Box display="flex" justifyContent="space-between">
                <H1>Add instance</H1>
                <Button action="view">Go back</Button>
            </Box>

            <Box>
                ${notice ? htm`
                    <Box padding="1rem">
                        ${notice}
                    </Box>
                `: ''}

                <Container>
                    <Input label="Instance name" name="instanceName" value=${
                        formStore.instanceName
                    } />
                    <Input label="Instance host" name="instanceHost" value=${
                        formStore.instanceHost
                    } />
                    <Input label="Instance port" name="instancePort" value=${
                        formStore.instancePort
                    } />
                    <Input label="Instance vhost" name="instanceVhost" value=${
                        formStore.instanceVhost
                    } />
                    <Input label="Instance username" name="instanceUsername" value=${
                        formStore.instanceUsername
                    } />
                    <Input label="Instance password" name="instancePassword" value=${
                        formStore.instancePassword
                    }/>

                    <Button action="submit-instance">Submit</Button>
                </Container>
            </Box>
        </Page>
    `;
}
