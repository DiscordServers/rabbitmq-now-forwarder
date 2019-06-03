import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';
import Metadata from '../types/Metadata';

const setMetadata = async (configuration: Configuration, metadata: Metadata): Promise<Metadata> => {
    const response = await fetch(
        `https://api.zeit.co/v1/integrations/configuration/${configuration.configurationId}/metadata`,
        {
            headers: {
                'Authorization': `Bearer ${configuration.accessToken}`,
                'Content-Type':  'application/json',
            },
            method:  'POST',
            body:    JSON.stringify(metadata),
        },
    );

    return await response.json();
};

export default setMetadata;
