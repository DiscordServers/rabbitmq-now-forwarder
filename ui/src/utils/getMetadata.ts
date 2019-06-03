import fetch from 'node-fetch';
import Metadata from '../types/Metadata';

const getMetadata = async (token: string, configurationId: string): Promise<Metadata> => {
    const response = await fetch(
        `https://api.zeit.co/v1/integrations/configuration/${configurationId}/metadata`,
        {
            headers: {
                Authorization: token,
            },
        },
    );

    const metadata = await response.json();
    if (metadata.error) {
        throw new Error(JSON.stringify(metadata.error));
    }

    return metadata;
};

export default getMetadata;
