import {htm, withUiHook} from '@zeit/integration-utils';
import {UiHookPayload} from '@zeit/integration-utils/lib';
import {BodyItem, HeaderItem, Table, TableRow} from '../components/Table';
import nowMetadata from '../types/metadata';
import {
    addInstance,
    deleteInstance,
    getGeneratedKey,
    getInstance,
    getInstances,
    regenerateKey,
} from '../utils/instances';
import manageLink from '../utils/manageLink';
import createPage from './create';
import viewInstance from './viewInstance';

const formStore = {
    emailNotifications: false,
};

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
    const {action, clientState} = payload;
    let notice: string | undefined;
    let error;

    const metadata: nowMetadata = await zeitClient.getMetadata();
    if (!metadata.linked) {
        metadata.linked = {};
        await zeitClient.setMetadata(metadata);
    }

    let publicKey               = metadata.public_key;
    if (!publicKey) {
        publicKey = await getGeneratedKey(payload.configurationId);
        if (!publicKey) {
            publicKey = await regenerateKey(payload.configurationId, handler);
        }
    }

    if (!metadata.preferences) {
        metadata.preferences = {
            email_notifications: formStore.emailNotifications,
        };
        await zeitClient.setMetadata(metadata);
    }

    formStore.emailNotifications = metadata.preferences.email_notifications;

    switch (true) {
        case ['add-instance'].includes(action):
            return createPage(handler);
        case startsWithAny(
            action,
            'toggle-listener',
            'submit-listener',
            'submit-instance',
            'update-instance',
            'view-instance-',
            'delete-listener-',
        ):
            if (action === 'submit-instance') {
                try {
                    const newInstance = await addInstance(
                        {
                            name:     clientState.instanceName,
                            host:     clientState.instanceHost,
                            port:     clientState.instancePort,
                            vhost:    clientState.instanceVhost,
                            username: clientState.instanceUsername,
                            password: clientState.instancePassword,
                        },
                        handler,
                    );

                    notice = htm`
                        <Notice type="success">
                            Successfully added instance <B>${newInstance.name}</B> with ID <B>${newInstance.id}</B>
                        </Notice>
                    `;
                    return viewInstance(handler, notice, newInstance.id);
                } catch (error) {
                    notice = htm`
                        <Notice type="error">
                            Failed adding the instance for the following reason: <B>${error.message}</B>
                        </Notice>
                    `;

                    return createPage(handler, notice);
                }
            }

            return viewInstance(handler);
        case action.startsWith('delete-instance'):
            const instanceId = action.substring('delete-instance-'.length);
            const instance   = await getInstance(instanceId, handler);

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
        case action === 'update-preferences':
            formStore.emailNotifications             = clientState.emailNotifications;
            metadata.preferences.email_notifications = clientState.emailNotifications;

            await zeitClient.setMetadata(metadata);
            notice = htm`
                <Notice type="success">
                    Successfully updated your preferences
                </Notice>
            `;
            break;
        case action === 'regenerate-key':
            publicKey = await regenerateKey(payload.configurationId, handler);
            notice    = htm`
                <Notice type="success">
                    Regenerated public key
                </Notice>
            `;
            break;
        case action === 'link' || action === 'unlink':
            if (!payload.projectId) {
                notice = htm`<Notice type="error">
                    To Link or Unlink, select a project view. <ProjectSwitcher />
                </Notice>`;
            } else {
                await manageLink(handler, metadata, publicKey, action as 'link' | 'unlink');
                // @todo Remove this notice
                if (action === 'unlink') {
                    notice = htm`<Notice type="success">
                    Project has been un-linked
                </Notice>`;
                } else {
                    notice = htm`<Notice type="success">
                    Project has been linked
                </Notice>`;
                }
            }
            break;
    }

    // Return main screen by default
    payload.clientState = {};
    const instances     = await getInstances(handler);

    return htm`
        <Page>
            <Box marginBottom="10px" textAlign="right">
                <ProjectSwitcher />
            </Box>
    		${error ? `<Notice type="error">${error}</Notice>` : ''}
            <Box display="flex" justifyContent="space-between">
                <H1>Your RabbitMQ Instances</H1>
                <Button action="add-instance">Add Instance</Button>
            </Box>

            <Box>
                ${notice ? htm`<Box padding="1rem">${notice}</Box>` : ''}
                <${Table} header=${htm`
                    <${HeaderItem}>Instance</${HeaderItem}>
                    <${HeaderItem}>Listener Amount</${HeaderItem}>
                    <${HeaderItem}>Delete Instance</${HeaderItem}>
                `}>
                    ${instances.map((instance) => {
        return htm`
                        <${TableRow}>
                            <${BodyItem}><Button small action=${`view-instance-${instance.id}`}>${
            instance.name
            }</Button></${BodyItem}>
                            <${BodyItem}>${instance.listeners.length}</${BodyItem}>
                            <${BodyItem}><Button small themeColor="red" action=${`delete-instance-${
            instance.id
            }`}>Delete</Button></${BodyItem}>
                        </${TableRow}>
                        `;
    })}
                </${Table}>
            </Box>

            <Box display="flex" justify-content="space-between">
                <Box width="48%">
                    <H1>Preferences</H1>
                    <Fieldset>
                        <FsContent>
                            <Box>
                                <Checkbox name="emailNotifications" label="Email Notifications"
                                checked=${formStore.emailNotifications} />
                                <Box font-style="italic">
                                    We will disable listeners that go over 20% in failure responses in a 30 minute period. To be notified when this happens, please check this box.
                                </Box>
                            </Box>
                        </FsContent>
                        <FsFooter>
                            <Button action="update-preferences" value=${formStore.emailNotifications}>Update</Button>
                        </FsFooter>
                    </Fieldset>
                </Box>
                <Box width="48%">
                    <H1>Public Key</H1>
                    ${renderLinkBox(payload, metadata)}
                    <Fieldset>
                        <FsContent>
                            <Textarea width="100%" disabled>${publicKey}</Textarea>
                        </FsContent>
                        <FsFooter>
                            <Button action="regenerate-key">Regenerate</Button>
                        </FsFooter>
                    </Fieldset>
                </Box>
            </Box>
        </Page>
    `;
});

const renderLinkBox = (payload: UiHookPayload, metadata: nowMetadata) => {
    const notice = htm`<Box font-style="italic" marginTop="1rem">
    <P>Once linked, the public key will be available to your deployments as the RABBIT_FORWARDER_PUBLIC_KEY env var.</P>
</Box>`;

    if (!payload.projectId) {
        return htm`<Box>
    <P>Select a project to link to it <ProjectSwitcher />.</P>
    ${notice}
</Box>`;
    }

    if (metadata.linked[payload.projectId]) {
        return htm`<Box><Button small action="unlink">Unlink From Project</Button>${notice}</Box>`;
    }

    return htm`<Box><Button small action="link">Link To Project</Button>${notice}</Box>`;
};
