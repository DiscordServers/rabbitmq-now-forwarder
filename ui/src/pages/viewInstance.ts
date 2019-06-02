import {htm, HandlerOptions} from '@zeit/integration-utils';
import {getInstances, addListener, deleteListener} from '../utils/instances';
import {Table, HeaderItem, TableRow, BodyItem} from '../components/Table';

let formStore = {
    listenerEndpoint: '',
    listenerQueue: '',
};

export default async function viewInstance(handler: HandlerOptions) {
    const {payload} = handler;
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
        <Box display="none">
          <Input name="instanceId" value=${instanceId} />
        </Box>
      </Box>
    </Page>
  `;
}
