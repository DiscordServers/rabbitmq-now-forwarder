import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';
import {User} from './getUser';

export interface Team {
    id: string;
    slug: string;
    name: string;
    creatorId: string;
    avatar: string;
}

const getTeam = async (configuration: Configuration): Promise<Team> => {
    const response = await fetch(
        `https://api.zeit.co/v1/teams/${configuration.teamId}`,
        {
            headers: {
                Authorization: `Bearer ${configuration.accessToken}`,
            },
        },
    );

    return (await response.json());
};

export default getTeam;
