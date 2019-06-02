import {htm, HandlerOptions} from '@zeit/integration-utils';
import {getInstances, addListener, deleteListener, updateInstance} from '../utils/instances';
import {Table, HeaderItem, TableRow, BodyItem} from '../components/Table';

let formStore = {
    listenerEndpoint: '',
    listenerQueue: '',
    instanceName: '',
    instanceHost: '',
    instancePort: '',
    instanceVhost: '',
    instanceUsername: '',
    instancePassword: '',
};

export default async function viewInstance(handler: HandlerOptions) {
    const {payload, zeitClient} = handler;
    const {action, clientState} = payload;
    let instanceId: string;
    let notice: string | undefined;

    if (action.startsWith('view-instance')) {
        clientState.instanceId = action.substring('view-instance-'.length);
    }

    instanceId = clientState.instanceId;

    if (action === 'update-instance') {
        try {
            await updateInstance(
                instanceId,
                {
                    name: clientState.instanceName,
                    host: clientState.instanceHost,
                    port: clientState.instancePort,
                    vhost: clientState.instanceVhost,
                    username: clientState.instanceUsername,
                    password: clientState.instancePassword,
                },
                handler,
            );

            notice = htm`
          <Notice type="success">
            Successfully updated the instance
          </Notice>
        `;
        } catch (error) {
            notice = htm`
          <Notice type="error">
            Failed updating the instance for the following reason: <B>${error.message}</B>
          </Notice>
        `;
        }
    }

    if (action === 'submit-listener') {
        formStore.listenerEndpoint = clientState.listenerEndpoint;
        formStore.listenerQueue = clientState.listenerQueue;

        try {
            await addListener(instanceId, formStore.listenerEndpoint, formStore.listenerQueue, handler);

            notice = htm`
        <Notice type="success">
          Successfully added the listener
        </Notice>
      `;
        } catch (error) {
            notice = htm`
        <Notice type="error">
          Failed adding the listener for the following reason: <B>${error.message}</B>
        </Notice>
      `;
        }
    }
    if (action.startsWith('delete-listener')) {
        try {
            await deleteListener(instanceId, action.split('-')[2], handler);

            notice = htm`
        <Notice type="success">
          Successfully removed listener
        </Notice>
      `;
        } catch (error) {
            notice = htm`
        <Notice type="error">
          Failed removing the listener for the following reason: <B>${error.message}</B>
        </Notice>
      `;
        }
    }

    const instances = await getInstances(handler);
    const instance = instances.find((instance) => instance.id === instanceId);
    const {connection} = instance;

    formStore.instanceName = instance.name;
    formStore.instanceHost = connection.host;
    formStore.instancePort = connection.port;
    formStore.instanceVhost = connection.vhost;
    formStore.instanceUsername = connection.username;
    formStore.instancePassword = connection.password;

    console.log(instanceId);

    return htm`
    <Page>
      <Box display="flex" justifyContent="space-between">
        <H1>${instance.name} - ${instance.id}</H1>
        <Button action="view">Go Back</Button>
      </Box>

      <Box>
        ${
            notice
                ? htm`
          <Box padding="1rem">
            ${notice}
          </Box>
        `
                : ''
        }

        <H1>Listeners</H1>
        <${Table} header=${htm`
          <${HeaderItem}>Endpoint</${HeaderItem}>
          <${HeaderItem}>Queue</${HeaderItem}>
          <${HeaderItem}>Delete Endpoint</${HeaderItem}>
        `}>
          ${instance.listeners.map((listener, index) => {
              return htm`
              <${TableRow}>
                <${BodyItem}>${listener.endpoint}</${BodyItem}>
                <${BodyItem}>${listener.queue}</${BodyItem}>
                <${BodyItem}><Button small themeColor="red" action=${`delete-listener-${index}`}>Delete</Button></${BodyItem}>
              </${TableRow}>
            `;
          })}
        </${Table}>

        <H1>Add listener</H1>
        <Fieldset>
          <FsContent>
            <Box display="flex">
              <Box padding-right="10px">
                <Input name="listenerEndpoint" label="Listener Endpoint" value=${formStore.listenerEndpoint} />
              </Box>
              <BR />
              <Input name="listenerQueue" label="Listener Queue" value=${formStore.listenerQueue} />
            </Box>
          </FsContent>
          <FsFooter>
            <Button action="submit-listener">Add Listener</Button>
          </FsFooter>
        </Fieldset>

        <H1>Update Instance</H1>
        <Fieldset>
          <FsContent>
            <Box display="flex">
              <Box padding-right="10px">
                <Input label="Instance name" name="instanceName" value=${formStore.instanceName} />
              </Box>
              <Box padding-right="10px">
                <Input label="Instance host" name="instanceHost" value=${formStore.instanceHost} />
              </Box>
            </Box>
            <Box display="flex">
              <Box padding-right="10px">
                <Input label="Instance port" name="instancePort" value=${formStore.instancePort} />
              </Box>
              <Box padding-right="10px">
                <Input label="Instance vhost" name="instanceVhost" value=${formStore.instanceVhost} />
              </Box>
            </Box>
            <Box display="flex">
              <Box padding-right="10px">
                <Input label="Instance username" name="instanceUsername" value=${formStore.instanceUsername} />
              </Box>
              <Box padding-right="10px">
                <Input type="password" label="Instance password" name="instancePassword" value=${
                    formStore.instancePassword
                }/>
              </Box>
            </Box>
          </FsContent>
          <FsFooter>
            <Button action="update-instance">Update</Button>
          </FsFooter>
        </Fieldset>

        <Box display="none">
          <Input name="instanceId" value=${instanceId} />
        </Box>
      </Box>
    </Page>
  `;
}
