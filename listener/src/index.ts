import {cpu} from 'node-os-utils';

import getInstance from './util/getInstance';
import sleep from './util/sleep';

async function main() {
    let usage: number = await cpu.usage();
    while (usage < 85.0) {
        let instance = await getInstance();
        if (!instance) {
            await sleep(30000);
            continue;
        }

        instance.on('closed', () => instance = undefined);

        await sleep(5000);
    }
}

main().catch(console.error);
