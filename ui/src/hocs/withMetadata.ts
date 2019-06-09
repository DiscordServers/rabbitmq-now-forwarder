import {IncomingMessage, ServerResponse} from 'http';

import {RequestHandler, send} from 'micro';
import * as parseQuery from 'micro-query';

import Metadata from '../types/Metadata';
import getMetadata from '../utils/getMetadata';

export interface RequestWithMetadata extends IncomingMessage {
    query: {
        configurationId: string;
        [key: string]: string;
    };
    metadata: Metadata;
}

export default (handler: RequestHandler) => async (req: RequestWithMetadata, res: ServerResponse) => {
    if (!req.headers || !req.headers.authorization) {
        return send(res, 401, 'Missing authorization header');
    }

    req.query = parseQuery(req);
    if (!req.query.configurationId) {
        return send(res, 401, 'Missing configurationId');
    }

    const token = req.headers.authorization;
    try {
        req.metadata = await getMetadata(token, req.query.configurationId);

        return handler(req, res);
    } catch (e) {
        return send(res, 403, e.message);
    }
};
