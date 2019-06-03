import {IncomingMessage, ServerResponse} from 'http';
import {json, send} from 'micro';
import * as NodeRSA from 'node-rsa';

const getKey = () => {
    const key = process.env.RABBIT_FORWARDER_PUBLIC_KEY;
    console.log('Public Key: ', key);

    return new NodeRSA(key);
}

export default async function(req: IncomingMessage, res: ServerResponse) {
    const body: any = await json(req);
    body.message = body.message.toString('utf8');
    const headers = req.headers;
    const verified = getKey().verify(body.message, body.signature, 'utf8', 'base64');

    console.log({
        body,
        headers,
        verified,
    });

    return send(res, verified ? 204 : 403);
}
