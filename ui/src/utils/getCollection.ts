import {Collection, Db, MongoClient} from 'mongodb';

const client = new MongoClient(process.env.MONGO_URL);
const dbName = process.env.NOW_REGION === 'dev1' ? 'dev' : 'production';

let db: Db;
let collection: Collection;

export interface Configuration {
    userId: string;
    teamId?: string;
    configurationId: string;
    accessToken: string;
    privateKey: string;
    publicKey: string;
}

const getCollection = async (): Promise<Collection<Configuration>> => {
    if (!client.isConnected()) {
        await client.connect();
        db = client.db(dbName);
        collection = db.collection<Configuration>('configurations');

        if (!(await collection.indexExists('configurationId'))) {
            await collection.createIndex('configurationId', {unique: true});
        }
        if (!(await collection.indexExists(['userId', 'teamId']))) {
            await collection.createIndex(['userId', 'teamId']);
        }
    }

    return collection;
};

export default getCollection;
