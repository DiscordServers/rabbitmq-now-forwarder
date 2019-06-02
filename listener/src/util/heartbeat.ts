import Configuration from '../types/Collection/Configuration';
import DBInstance from '../types/Collection/Instance';
import {Instance} from '../types/Metadata';
import getCollection from './getCollection';

const heartbeat = async (configuration: Configuration, instance: Instance) => {
    const collection = await getCollection<DBInstance>('instances');
    await collection.updateOne(
        {instanceId: instance.id},
        {$set: {configurationId: configuration.configurationId, lastHeartbeat: Date.now()}},
        {upsert: true},
    );

    console.debug('Heartbeating for: ' + instance.id);
};

export default heartbeat;
