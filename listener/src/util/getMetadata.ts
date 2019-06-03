import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';
import Metadata from '../types/Metadata';

const getMetadata = async (configuration: Configuration): Promise<Metadata> => {
    console.log(configuration);
    const response = await fetch(
        `https://api.zeit.co/v1/integrations/configuration/${configuration.configurationId}/metadata`,
        {
            headers: {
                Authorization: `Bearer ${configuration.accessToken}`,
            },
        },
    );

    return await response.json();
};

export default getMetadata;
