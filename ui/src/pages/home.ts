import {htm} from '@zeit/integration-utils/lib';

const home = ({handler, router, params}) => {
    return htm`
<Box>
    <B>Welcome Home!</B>
</Box>
`;
}

export default home;
