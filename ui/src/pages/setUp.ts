import {parse, UrlWithStringQuery} from 'url';

import {htm} from '@zeit/integration-utils/lib';
import {Route, Router} from 'zeit-router';

import {Card} from '../components/Card';
import {WizardInput} from '../components/Form';
import getObservableMetadata from '../utils/getObservableMetadata';
import {addInstance} from '../utils/instances';
import {addListener} from '../utils/listeners';

const store = {
    instance: {
        fqdn:     'amqp://',
        host:     '',
        port:     '5672',
        username: '',
        password: '',
        vhost:    '/',
        name:     '',
    },
    listener: {
        endpoint:             '/',
        queue:                '',
        expectedResponseCode: '200',
        retryOnFailure:       true,
    },
};

const errors = {
    instance: {
        fqdn: false,
    },
    listener: {
        endpoint:             false,
        queue:                false,
        expectedResponseCode: false,
    },
};

type Step = (route: Route) => any | Promise<any>;

const steps: Step[] = [
    () => htm`
<Box>
    <H2>First, tell us about your RabbitMQ instance (You can add other instances later):</H2>
    <${WizardInput} name="fqdn" label="Enter in the FQDN for your rabbit instance"
         example="amqp://username:password@wildabeast.rmq.cloudamqp.com/somevhost" errored="${errors.instance.fqdn}"
         errorText="Must be a valid FQDN" value="${store.instance.fqdn}" />
</Box>`,
    () => htm`
<Box>
    <H2>Now, lets set up your first subscriber. Don't worry, you can add more of these later as well.</H2>
    <Box>
        <${WizardInput} name="endpoint" note="This must be a relative link." errored="${errors.listener.endpoint}"
            label="What endpoint would you like to send messages to?" errorText="Must be a valid endpoint"
            value="${store.listener.endpoint}" example="/my-awesome-link"/>
    </Box>
    <Box>
        <${WizardInput} name="queue" errored="${errors.listener.queue}"
            label="What queue would you like to subscribe to?" errorText="Must be set"
            value="${store.listener.queue}" example="my-queue"/>
    </Box>
    <Box>
        <${WizardInput} name="expectedResponseCode" errored="${errors.listener.expectedResponseCode}"
            label="What status will your endpoint respond with on success?" errorText="Must be a valid response code"
            value="${store.listener.expectedResponseCode}" example="200"/>
    </Box>
</Box>
`,
    async ({router, handler}) => {
        const instance = await addInstance(store.instance, handler);
        await addListener(instance.id, store.listener, handler);

        const metadata   = await getObservableMetadata(handler);
        metadata.isSetUp = true;
        await metadata.save();

        return htm`
<Box text-align="center">
    <H2>Your configuration has been saved!</H2>
    <Button action="/">Continue to Dashboard</Button>
</Box>
`;
    },
];
const getStep       = (step) => steps[step - 1];

const Buttons = ({currentStep}) => {
    const step = parseInt(currentStep, 10);
    if (step === steps.length) {
        return '';
    }

    const hasPrevious = getStep(step - 1) !== undefined;
    const previous    = hasPrevious ? `/setUp/${step - 1}` : '';

    const hasNext = step + 1 === steps.length ? false : getStep(step + 1) !== undefined;
    const next    = `/setUp/${step + 1}`;

    return htm`
<Box display="flex" justify-content="flex-end" align-items="center" align-content="center" width="100%">
    <Box display="inline-block" flex-grow="0" flex-shrink="0" flex-basis="auto" align-self="auto" width="10%" order="0">
        <Button small secondary disabled="${!hasPrevious}" action="${previous}">Previous</Button>
    </Box>
    <Box display="inline-block" flex-grow="0" flex-shrink="0" flex-basis="auto" align-self="auto" width="10%" order="1">
        <Button small highlight action="${next}">${hasNext ? 'Next' : 'Submit'}</Button>
    </Box>
</Box>
`;
};

const isValidFqdn = (parsed: UrlWithStringQuery) => {
    if (!parsed) {
        console.log('Failed to parse', store.instance.fqdn);
        return false;
    }

    if (!parsed.protocol.startsWith('amqp:')) {
        console.log('Wrong Protocol', parsed.protocol);
        return false;
    }
    if (!parsed.auth) {
        console.log('No Auth', parsed.auth);
        return false;
    }
    if (!parsed.hostname) {
        console.log('No Hostname', parsed.hostname);
        return false;
    }

    errors.instance.fqdn = false;
    return true;
};

const validate = async (step: number, clientState, router: Router): Promise<[number, string | null]> => {
    interface Steps {
        1: { fqdn: string };
        2: { endpoint: string; queue: string; expectedResponseCode: string };
    }

    // Switch on the previously submitted step
    switch (step - 1) {
        case 1:
            const {fqdn}: Steps[1] = clientState;
            const parsed           = parse(clientState.fqdn);
            if (!isValidFqdn(parsed)) {
                errors.instance.fqdn = true;

                return [1, '/setUp/1'];
            }

            const [username, password] = parsed.auth.split(':');
            store.instance             = {
                name:  `${username} @ ${parsed.hostname}`,
                host:  parsed.hostname,
                port:  parsed.port || '5672',
                vhost: parsed.path || '/',
                fqdn,
                username,
                password,
            };
            break;
        case 2:
            const {endpoint, queue, expectedResponseCode}: Steps[2] = clientState;

            let errored = false;

            if (!/^\//.test(endpoint)) {
                errors.listener.endpoint = true;
                errored                  = true;
            }

            if (!/^[A-Za-z0-9-_\s]+$/.test(queue)) {
                errors.listener.queue = true;
                errored               = true;
            }

            if (!/^[1-5][0-9][0-9]$/.test(expectedResponseCode)) {
                errors.listener.expectedResponseCode = true;
                errored                              = true;
            }

            if (errored) {
                return [2, '/setUp/2'];
            }

            store.listener = {
                endpoint,
                queue,
                expectedResponseCode,
                retryOnFailure: true,
            };

            break;
    }

    return [step, null];
};

const setUp = async (route: Route) => {
    const {handler, router, params} = route;
    const {payload: {clientState}}  = handler;
    let currentStep                 = (parseInt(params.step as string, 10) || 1);

    if (clientState.currentStore) {
        const currentStore = JSON.parse(clientState.currentStore);
        store.instance     = currentStore.instance;
        store.listener     = currentStore.listener;
    }

    const [step, newUrl] = await validate(currentStep, clientState, router);
    if (newUrl) {
        await router.navigate(newUrl);
    }

    return htm`
<Box>
    <ClientState key="currentStore" value="${JSON.stringify(store)}" />
    <H1>Welcome to the Set Up of your RabbitMQ Forwarder!</H1>
    <HR />
    <P>
        Since this is your first time using this integration on this account/team, we are going to walk you through
        setting up the integration.
    </P>
    <P>Get started by filling out the form below!</P>
    <${Card}>
        ${await getStep(step)(route)}
        <${Buttons} currentStep="${step}" />
    </${Card}>
</Box>
`;
};

export default setUp;
