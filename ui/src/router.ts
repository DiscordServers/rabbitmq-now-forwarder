import {htm} from '@zeit/integration-utils/lib';
import {HandlerOptions, Router, ZeitRouter} from 'zeit-router';
import {Card} from './components/Card';

import home from './pages/home';
import setUp from './pages/setUp';
import getObservableMetadata from './utils/getObservableMetadata';

const app = new ZeitRouter('/');

app.add('/', home);
app.add('/setUp', setUp);
app.add('/setUp/:step', setUp);

export default app.uiHook(async (handler: HandlerOptions, router: Router) => {
    let {payload: {action, projectId}} = handler;
    const metadata                       = await getObservableMetadata(handler);

    // Temporary fix
    projectId = 'QmPVB3e5DoksAPDoDq5dKnamEaYKmirvj5ouLmoLkh1MSy';

    if (!projectId) {
        return htm`
<${Card}>
    <Box margin="2rem auto" width="60%" text-align="center">
        <H2>Please select a project to ${!metadata.isSetUp ? 'get started' : 'continue'}</H2>
        <ProjectSwitcher />
    </Box>
</${Card}>`;
    }

    let isSettingUp = /^\/setUp/.test(router.currentPath);
    console.log(router.currentPath, isSettingUp);

    switch (true) {
        default:
            break;
        case !metadata.isSetUp && !isSettingUp:
            await router.navigate('/setUp/1');
            break;
        case action === 'home':
            await router.navigate('/');
            break;
    }
    // Reset due to redirect
    isSettingUp = /^\/setUp/.test(router.currentPath);

    if (isSettingUp) {
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
