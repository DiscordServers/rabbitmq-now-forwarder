import {htm, HandlerOptions} from '@zeit/integration-utils';
import {getInstances, addListener, deleteListener} from '../utils/instances';

let formStore = {
    listenerEndpoint: '',
    listenerQueue: '',
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

    if (action === 'submit-listener') {
        formStore = clientState;

        try {
            await addListener(
                instanceId,
                formStore.listenerEndpoint,
                formStore.listenerQueue,
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
          Failed adding the listener for the following reason: <B>${
              error.message
          }</B>
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
          Failed removing the listener for the following reason: <B>${
              error.message
          }</B>
        </Notice>
      `;
        }
    }

    const instances = await getInstances(handler);
    const instance = instances.find((instance) => instance.id === instanceId);
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

        <H2>Listeners</H2>
        <UL>
          <Box margin-bottom="50px">
            ${instance.listeners.map((listener, index) => {
                return htm`
                <Box padding-bottom="4px" word-break="break-all" width="25rem" border-bottom="1px solid black">
                  <B>Webhook URL:</B> ${listener.endpoint}
                  <BR />
                  <B>Queue:</B> ${listener.queue}
                  <BR />
                  <Button small themeColor="red" action=${`delete-listener-${index}`}>Delete</Button>
                </Box>
              `;
            })}
          </Box>
        </UL>
        <H2>Add listener</H2>
        <Box>
          <Input name="listenerEndpoint" placeholder="Listener Endpoint" value=${
              formStore.listenerEndpoint
          } />
          <BR />
          <Input name="listenerQueue" placeholder="Listener Queue" value=${
              formStore.listenerQueue
          } />
          <BR />
          <BR />
          <Button action="submit-listener">Add Listener</Button>
        </Box>
        <Box display="none">
          <Input name="instanceId" value=${instanceId} />
        </Box>
      </Box>
    </Page>
  `;
}
