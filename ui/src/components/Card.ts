import {htm} from '@zeit/integration-utils';

export const Card = ({children}) => htm`
    <Box border-radius=".25rem" border="1px solid black" background="white" padding="2rem">
        ${children}
    </Box>
`;

