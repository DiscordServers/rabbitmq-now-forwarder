import {send} from 'micro';
import withMetadata, {RequestWithMetadata} from '../hocs/withMetadata';
import {generateKeys} from '../utils/generateKeys';
import getCollection, {Configuration} from '../utils/getCollection';

export default withMetadata(async (req: RequestWithMetadata, res) => {
    const collection = await getCollection();
    const {publicKey, privateKey} = await generateKeys();

    await collection.updateOne({configurationId: req.query.configurationId}, {$set: {publicKey, privateKey}});

    const config: Configuration = await collection.findOne<Configuration>({configurationId: req.query.configurationId});

    return send(res, config ? 200 : 204, config ? config.publicKey : null);
});
