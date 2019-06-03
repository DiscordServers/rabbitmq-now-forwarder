import Configuration from '../types/Collection/Configuration';
import Instance from '../types/Collection/Instance';
import InstanceModel from '../model/Instance';
import getCollection from './getCollection';
import getMetadata from './getMetadata';

/**
 * I'm not very happy with this logic. Would like to make it more resource efficient
 * @return {Promise<void>}
 */
const getInstance = async (): Promise<InstanceModel | null> => {
    const configurationCollection = await getCollection<Configuration>('configurations');
    const instancesCollection = await getCollection<Instance>('instances');

    const configurations = await configurationCollection.find();
    while (await configurations.hasNext()) {
        const configuration = await configurations.next();
        const metadata = await getMetadata(configuration);
        if (metadata.error) {
            console.error('Bad access code on: ' + configuration.configurationId, metadata);
            await configurationCollection.deleteOne({configurationId: configuration.configurationId});

            continue;
        }

        for (const instance of metadata.instances || []) {
            const dbInstance = await instancesCollection.findOne({instanceId: instance.id});
            if (!dbInstance || dbInstance.lastHeartbeat < Date.now() - 1000 * 15) {
                return new InstanceModel(configuration, metadata, instance);
            }
        }
    }

    console.log('No available instances');

    return null;
};

export default getInstance;
