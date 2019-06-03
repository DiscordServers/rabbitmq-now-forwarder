import {htm, HandlerOptions} from '@zeit/integration-utils';
import {addInstance} from '../utils/instances';

let formStore = {
    instanceName: '',
    instanceHost: '',
    instancePort: '5672',
    instanceVhost: '',
    instanceUsername: '',
    instancePassword: '',
};

export default async function createPage(handler: HandlerOptions, notice: string = '') {
    const {payload} = handler;
    const {action, clientState} = payload;

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
            `;
        } catch (error) {
            notice = htm`
                <Notice type="error">
                    Failed adding the instance for the following reason: <B>${error.message}</B>
                </Notice>
            `;
        }
    }

    return htm`
        <Page>
            <Box display="flex" justifyContent="space-between">
                <H1>Add instance</H1>
                <Button action="view">Go back</Button>
            </Box>

            <Box margin-top="15px">
                ${
                    notice
                        ? htm`
                    <Box padding="1rem">
                        ${notice}
                    </Box>
                `
                        : ''
                }

                <Fieldset>
                    <FsContent>
                        <P>
                            We require all this information in order to connect to your queue and forward messages to your endpoint.
                            Rest assured, we neither log, nor store any messages, and all of your connection info is stored securely.
                        </P>
                        <Box display="flex">
                            <Box padding-right="10px">
                                <Input label="Instance Name" name="instanceName" value=${formStore.instanceName} />
                            </Box>
                            <Box padding-right="10px">
                                <Input label="Instance Host" name="instanceHost" value=${formStore.instanceHost} />
                            </Box>
                        </Box>
                        <Box display="flex">
                            <Box padding-right="10px">
                                <Input label="Instance Port" name="instancePort" value=${formStore.instancePort} />
                            </Box>
                            <Box padding-right="10px">
                                <Input label="Instance Virtual Host" name="instanceVhost" placeholder="Optional" value=${
                                    formStore.instanceVhost
                                } />
                            </Box>
                        </Box>
                        <Box display="flex">
                            <Box padding-right="10px">
                                <Input label="Instance Username" name="instanceUsername" value=${
                                    formStore.instanceUsername
                                } />
                            </Box>
                            <Box padding-right="10px">
                                <Input type="password" label="Instance Password" name="instancePassword" value=${
                                    formStore.instancePassword
                                }/>
                            </Box>
                        </Box>
                    </FsContent>
                    <FsFooter>
                        <Button action="submit-instance">Submit</Button>
                    </FsFooter>
                </Fieldset>
            </Box>
        </Page>
    `;
}
