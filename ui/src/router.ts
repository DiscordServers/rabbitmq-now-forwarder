import {htm} from '@zeit/integration-utils/lib';
import {HandlerOptions, Router, ZeitRouter} from 'zeit-router';

import home from './pages/home';
import setUp from './pages/setUp';
import getObservableMetadata from './utils/getObservableMetadata';

const app = new ZeitRouter('/');

app.add('/', home);
app.add('/setUp', setUp);
app.add('/setUp/:step', setUp);

export default app.uiHook(async (handler: HandlerOptions, router: Router) => {
    const metadata            = await getObservableMetadata(handler);
    const {payload: {action}} = handler;

    switch (true) {
        default:
            break;
        case !metadata.isSetUp:
            await router.navigate('/setUp');
            break;
        case action === 'home':
            await router.navigate('/');
            break;
    }

    if (router.currentPath === '/setUp') {
        return htm`<Page>${await router.currentRoute}</Page>`;
    }

    return htm`
<Page>
    <Button action="home" small highlight>home</Button>
    <Button action="/parameter/123" small highlight>parameter</Button>
    <Button action="fail" small warning>fail</Button>

    ${await router.currentRoute}

    Your are here: <B>${router.currentPath}</B>
  </Page>
`;
});
