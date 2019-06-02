import {IncomingMessage, ServerResponse} from 'http';
import {json, send} from 'micro';
import * as NodeRSA from 'node-rsa';

const getKey = () => {
    let buff = new Buffer(process.env.TEST_PUBLIC_KEY, 'base64');

    return new NodeRSA(buff.toString('utf8'));
};

export default async function(req: IncomingMessage, res: ServerResponse) {
    const body: any = await json(req);
    body.message    = body.message.toString('utf8');
    const headers   = req.headers;
    const verified  = getKey().verify(body.message, body.signature, 'utf8', 'base64');

    console.log({
        body,
        headers,
        verified,
    });

    return send(res, verified ? 204 : 403);
}
