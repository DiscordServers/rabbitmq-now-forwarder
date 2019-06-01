import {htm, withUiHook} from '@zeit/integration-utils';

export default withUiHook(({payload}) => {
    return htm`<Page>
    <P>Welcome!</P>
</Page>`;
});
