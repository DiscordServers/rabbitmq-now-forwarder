import {IncomingMessage, ServerResponse} from 'http';
import {json, send} from 'micro';

export default async function(req: IncomingMessage, res: ServerResponse) {
    console.log(await json(req));

    return send(res, 204);
}
