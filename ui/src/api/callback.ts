import {IncomingMessage, ServerResponse} from 'http';
import * as parseQuery from 'micro-query';
import {Collection, Db, MongoClient} from 'mongodb';
import fetch from 'node-fetch';
import {stringify} from 'querystring';

const client = new MongoClient(process.env.MONGO_URL);
const dbName = process.env.NOW_REGION === 'dev1' ? 'dev' : 'production';

let db: Db;
let collection: Collection;

interface Query {
    teamId: string;
    configurationId: string;
    code: string;
    next: string;
}

interface Configuration {
    userId: string;
    teamId?: string;
    configurationId: string;
    installationId: string;
}

interface AccessTokenResponse {
    access_token: string;
    token_type: 'Bearer';
    installation_id: string;
    user_id: string;
    team_id?: string;
}

export default async function(req: IncomingMessage, res: ServerResponse) {
    if (!client.isConnected()) {
        await client.connect();
        db = client.db(dbName);
        collection = db.collection<Configuration>('configurations');
    }

    const query: Query = parseQuery(req);
    const {code, next} = query;

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

    const document: Configuration = {
        userId: json.user_id,
        teamId: json.team_id,
        configurationId: query.configurationId,
        installationId: json.installation_id,
    };

    await collection.insertOne(document);

    res.statusCode = 301;
    res.setHeader('Location', next);
    res.end();
}
