import {cpu} from 'node-os-utils';

import getInstance from './util/getInstance';
import sleep from './util/sleep';
import spawnListener from './util/spawnListener';

async function main() {
    let usage: number = await cpu.usage();
    while (usage < 85.0) {
        const {configuration, instance} = await getInstance();
        if (!instance) {
            await sleep(30000);
            continue;
        }

        spawnListener(configuration, instance);

        await sleep(5000);
    }
}

main().catch(console.error);
