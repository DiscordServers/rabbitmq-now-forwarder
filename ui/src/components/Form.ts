import {htm} from '@zeit/integration-utils/lib';

import {Note} from './Note';

export const Example = ({text}) => htm`<Box font-style="italic" font-size="80%">e.g. ${text}</Box>`;

export const WizardInput = ({name, type = 'text', label, value, note, example, errorText, disabled = false, errored = false}) => {
    return htm`
<Box margin="2rem auto" width="70%">
    ${label ? htm`<B>${label}</B>` : ''}
    <Box margin=".5rem 0">
        <Input name="${name}" type="${type}" value="${value}" width="100%" errored="${errored}" disabled="${disabled}"/>
        ${errorText && errored ? htm`<Box color="red">${errorText}</Box>` : ''}
    </Box>
    ${note ? htm`<${Note} text="${note}" />` : ''}
    ${example ? htm`<${Example} text="${example}" />` : ''}
</Box>
`;
};
