import {IncomingMessage, ServerResponse} from 'http';
import * as parseQuery from 'micro-query';
import fetch from 'node-fetch';
import {stringify} from 'querystring';
import {generateKeys} from '../utils/generateKeys';
import getCollection, {Configuration} from '../utils/getCollection';

interface Query {
    teamId: string;
    configurationId: string;
    code: string;
    next: string;
}

interface AccessTokenResponse {
    access_token: string;
    token_type: 'Bearer';
    installation_id: string;
    user_id: string;
    team_id?: string;
}

export default async function(req: IncomingMessage, res: ServerResponse) {
    const query: Query = parseQuery(req);
    const {code, next} = query;
    if (!code) {
        res.statusCode = 204;
        res.end();

        return;
    }

    const response = await fetch('https://api.zeit.co/v2/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: stringify({
            client_id: process.env.ZEIT_CLIENT_ID,
            client_secret: process.env.ZEIT_CLIENT_SECRET,
            redirect_uri: process.env.ZEIT_CLIENT_REDIRECT_URI,
            code,
        }),
    });
    const json: AccessTokenResponse = await response.json();

    const {publicKey, privateKey} = await generateKeys();

    const document: Configuration = {
        userId: json.user_id,
        teamId: json.team_id,
        configurationId: query.configurationId,
        installationId: json.installation_id,
        accessToken: json.access_token,
        publicKey,
        privateKey,
    };

    await (await getCollection()).insertOne(document);

    res.statusCode = 301;
    res.setHeader('Location', next);
    res.end();
}
