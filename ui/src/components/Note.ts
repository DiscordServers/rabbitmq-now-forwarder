import {htm} from '@zeit/integration-utils';

export const Note = ({children = null, text = null}) => htm`
    <Box font-style="italic" font-size="70%">
        Note: ${text || children}
    </Box>
`;

