import {IncomingMessage, ServerResponse} from 'http';
import {send} from 'micro';
import * as parseQuery from 'micro-query';
import getCollection, {Configuration} from '../utils/getCollection';

export default async function(req: IncomingMessage, res: ServerResponse) {
    const collection = await getCollection();
    const query = parseQuery(req);

    const config: Configuration = await collection.findOne<Configuration>({configurationId: query.configurationId});

    return send(res, config ? 200 : 204, config ? config.publicKey : null);
}
