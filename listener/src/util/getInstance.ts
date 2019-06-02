import Configuration from '../types/Collection/Configuration';
import Instance from '../types/Collection/Instance';
import getCollection from './getCollection';
import getMetadata from './getMetadata';

/**
 * I'm not very happy with this logic. Would like to make it more resource efficient
 * @return {Promise<void>}
 */
const getInstance = async () => {
    const configurationCollection = await getCollection<Configuration>('configurations');
    const instancesCollection = await getCollection<Instance>('instances');

    const configurations = await configurationCollection.find();
    while (await configurations.hasNext()) {
        const configuration = await configurations.next();
        const metadata = await getMetadata(configuration);
        if (metadata.error) {
            console.error('Bad access code on: ' + configuration.configurationId);
            await configurationCollection.deleteOne({configurationId: configuration.configurationId});

            continue;
        }

        for (const instance of metadata.instances) {
            const dbInstance = await instancesCollection.findOne({instanceId: instance.id});
            if (!dbInstance) {
                return {instance, configuration};
            }

            if (dbInstance.lastHeartbeat < Date.now() - 1000 * 1) {
                return {instance, configuration};
            }
        }
    }

    console.log('No available instances');

    return {};
};

export default getInstance;
