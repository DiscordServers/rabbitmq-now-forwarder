import {htm, HandlerOptions} from '@zeit/integration-utils';
import {getInstances, addListener, deleteListener, updateInstance} from '../utils/instances';
import {Table, HeaderItem, TableRow, BodyItem} from '../components/Table';

let formStore = {
    listenerEndpoint: '',
    listenerQueue: '',
    listenerRetryOnFailure: true,
    listenerExpectedStatusCode: '',
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
        formStore.listenerRetryOnFailure = clientState.listenerRetryOnFailure;
        formStore.listenerExpectedStatusCode = clientState.listenerExpectedStatusCode;

        try {
            await addListener(
                instanceId,
                {
                    endpoint: formStore.listenerEndpoint,
                    queue: formStore.listenerQueue,
                    retry_on_failure: formStore.listenerRetryOnFailure === true,
                    expected_status_code:
                        formStore.listenerExpectedStatusCode !== ''
                            ? parseInt(formStore.listenerExpectedStatusCode)
                            : undefined,
                },
                handler,
            );

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
          <${HeaderItem}>Expected status code</${HeaderItem}>
          <${HeaderItem}>Retry on failure?</${HeaderItem}>
          <${HeaderItem}>Delete Endpoint</${HeaderItem}>
        `}>
          ${instance.listeners.map((listener, index) => {
              console.log(listener);
              return htm`
              <${TableRow}>
                <${BodyItem}>${listener.endpoint}</${BodyItem}>
                <${BodyItem}>${listener.queue}</${BodyItem}>
                <${BodyItem}>${listener.expected_status_code || ''}</${BodyItem}>
                <${BodyItem}>${listener.retry_on_failure ? 'yes' : 'no'}</${BodyItem}>
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
                <Input name="listenerEndpoint" label="Endpoint" value=${formStore.listenerEndpoint} />
              </Box>
              <Box padding-right="10px">
                <Input name="listenerQueue" label="Queue" value=${formStore.listenerQueue} />
              </Box>
            </Box>
            <Box display="flex">
              <Box padding-right="10px">
                <Input name="listenerExpectedStatusCode" label="Expected status code" value=${
                    formStore.listenerExpectedStatusCode
                } />
              </Box>
            </Box>
            <Box padding-top="10px">
              <Checkbox name="listenerRetryOnFailure" label="Retry on failure" checked=${
                  formStore.listenerRetryOnFailure
              } />
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
                <Input label="Instance Virtual Host" name="instanceVhost" value=${formStore.instanceVhost} />
              </Box>
            </Box>
            <Box display="flex">
              <Box padding-right="10px">
                <Input label="Instance Username" name="instanceUsername" value=${formStore.instanceUsername} />
              </Box>
              <Box padding-right="10px">
                <Input type="password" label="Instance Password" name="instancePassword" value=${
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
