import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';

export interface User {
    uid: string;
    email: string;
    username: string;
}

const getUser = async (configuration: Configuration): Promise<User> => {
    const response = await fetch(
        `https://api.zeit.co/www/user`,
        {
            headers: {
                Authorization: `Bearer ${configuration.accessToken}`,
            },
        },
    );

    const {uid, email, username} = (await response.json()).user;

    return {uid, email, username};
};

export default getUser;
