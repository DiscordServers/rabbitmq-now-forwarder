import {cpu} from 'node-os-utils';

import getInstance from './util/getInstance';
import sleep from './util/sleep';

async function main() {
    const instances = [];

    let usage: number = await cpu.usage();
    while (usage < 85.0) {
        const instance = await getInstance();
        console.log('Instance: ', instance);

        await sleep(5000);
    }
}

main().catch(console.error);
