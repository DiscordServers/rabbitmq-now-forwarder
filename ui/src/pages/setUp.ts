import {htm} from '@zeit/integration-utils/lib';

import {Card} from '../components/Card';

const store = {
    instance: {
        fqdn: 'amqp://',
    },
};

const Example = ({text}) => htm`<Box font-style="italic" font-size="80%">e.g.${text}</Box>`;

const WizardInput = ({name, label, value, example = null}) => {
    return htm`
<Box margin="2rem auto" width="70%">
    <B>${label}</B>
    <Box margin=".5rem 0"><Input name="${name}" value="${value}" width="100%"/></Box>
    ${example && htm`<${Example} text="${example}" />`}
</Box>
`;
};

const steps = [
    htm`
<Box>
    <H2>First, tell us about your RabbitMQ instance (You can add other instances later):</H2>
    <${WizardInput} name="fqdn" label="Enter in the FQDN for your rabbit instance"
     example="amqp://username:password@wildabeast.rmq.cloudamqp.com/somevhost" 
        value="${store.instance.fqdn}" />
</Box>`,
    'test',
];

const Buttons = ({currentStep}) => {
    const previous = steps[parseInt(currentStep, 10) - 1] !== undefined;
    const next     = steps[parseInt(currentStep, 10) + 1] !== undefined;

    return htm`
<Box display="flex" justify-content="flex-end" align-items="center" align-content="center" width="100%">
    <Box display="inline-block" flex-grow="0" flex-shrink="0" flex-basis="auto" align-self="auto" width="10%" order="0">
        <Button small secondary disabled="${!previous}">Previous</Button>
    </Box>
    <Box display="inline-block" flex-grow="0" flex-shrink="0" flex-basis="auto" align-self="auto" width="10%" order="1">
        <Button small highlight disabled="${!next}">Next</Button>
    </Box>
</Box>
`;
};

const setUp = ({handler, router, params}) => {
    const step = (parseInt(params.step, 10) || 1) - 1;

    return htm`
<Box>
    <H1>Welcome to the Set Up of your RabbitMQ Forwarder!</H1>
    <HR />
    <P>
        Since this is your first time using this integration on this account/team, we are going to walk you through
        setting up the integration.
    </P>
    <P>Get started by filling out the form below!</P>
    <${Card}>
        ${steps[step]}
        <${Buttons} currentStep="${step}" />
    </${Card}>
</Box>
`;
};

export default setUp;
