import {IncomingMessage, ServerResponse} from 'http';
import {json, send} from 'micro';
import * as crypto from 'crypto';

const getKey = () => {
    let buff = new Buffer(process.env.TEST_PUBLIC_KEY, 'base64');

    return buff.toString('ascii');
};

export default async function(req: IncomingMessage, res: ServerResponse) {
    const body: any = await json(req);
    body.message = body.message.toString('utf8');

    const headers = req.headers;

    const verifierObject = crypto.createVerify('RSA-SHA512');
    verifierObject.update(body.message);
    const verified = verifierObject.verify(getKey(), body.signature, 'base64');

    console.log({
        body,
        headers,
        verified,
    });

    return send(res, 204);
}
