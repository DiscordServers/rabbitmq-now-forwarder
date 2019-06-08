import {cpu} from 'node-os-utils';

import getInstance from './util/getInstance';
import getLogger from './util/getLogger';
import sleep from './util/sleep';

const logger = getLogger('main', 'index.ts');

async function index() {
    const instances = [];
    let usage: number = await cpu.usage();
    while (usage < 85.0) {
        let instance = await getInstance();
        if (!instance) {
            await sleep(30000);
        } else {
            instances.push(instance);

            instance.on('closed', () => {
                const index = instances.findIndex((i) => i === instance);
                if (index >= 0) {
                    instances.splice(index, 1);
                }
                instance = undefined;
            });

            await sleep(5000);
        }
        logger.debug('Current Status: %j', {instances: instances.length});
    }
}

index().catch((err) => logger.error(err));
