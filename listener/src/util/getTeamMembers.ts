import fetch from 'node-fetch';
import Configuration from '../types/Collection/Configuration';
import {User} from './getUser';

export interface TeamMember extends User {
    role: string;
}

const getTeamMembers = async (configuration: Configuration): Promise<TeamMember[]> => {
    const response = await fetch(
        `https://api.zeit.co/v1/teams/${configuration.teamId}/members`,
        {
            headers: {
                Authorization: `Bearer ${configuration.accessToken}`,
            },
        },
    );

    return (await response.json());
};

export default getTeamMembers;
