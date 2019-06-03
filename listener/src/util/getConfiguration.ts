import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';
import Metadata from '../types/Metadata';
import getCollection from './getCollection';

const getConfiguration = async (configuration: Configuration): Promise<Configuration> => {
    const collection = await getCollection<Configuration>('configurations');

    return collection.findOne({configurationId: configuration.configurationId});
};

export default getConfiguration;
