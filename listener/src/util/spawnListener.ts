import Configuration from '../types/Collection/Configuration';
import {Instance} from '../types/Metadata';
import getRabbitChannel from './getRabbitChannel';
import heartbeat from './heartbeat';
import processMessage from './processMessage';

const spawnListener = async (configuration: Configuration, instance: Instance) => {
    console.log('Spawning listener for: ' + instance.id);
    setInterval(() => heartbeat(configuration, instance), 5000);

    // Debugger
    // instance.listeners = [{queue: 'test', endpoint: 'https://google.com'}];

    const channel = await getRabbitChannel(instance);
    for (const listener of instance.listeners) {
        channel.consume(listener.queue, processMessage(configuration, instance, channel, listener));
    }
};

export default spawnListener;
