import {htm, HandlerOptions} from '@zeit/integration-utils';
import {addInstance} from './utils/instances';

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

    if (action === 'submit-instance') {
        formStore = clientState;

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

        clientState.newInstance = newInstance;
    }

    return htm`
        <Page>
            <Box display="flex" justifyContent="space-between">
                <H1>Add instance</H1>
                <Button action="view">Go back</Button>
            </Box>

            <Box>
                ${
                    clientState.newInstance
                        ? htm`<Box padding="1rem"><Notice type="success">Successfully added instance ${
                              clientState.newInstance.name
                          } with ID ${
                              clientState.newInstance.id
                          }</Notice></Box>`
                        : ''
                }
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
