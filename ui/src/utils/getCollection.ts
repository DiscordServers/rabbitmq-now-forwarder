import {Collection, Db, MongoClient} from 'mongodb';

const client = new MongoClient(process.env.MONGO_URL);
const dbName = process.env.NOW_REGION === 'dev1' ? 'dev' : 'production';

let db: Db;
let collection: Collection;

export interface Configuration {
    userId: string;
    teamId?: string;
    configurationId: string;
    installationId: string;
    accessToken: string;
    privateKey: string;
    publicKey: string;
}

const getCollection = async (): Promise<Collection> => {
    if (!client.isConnected()) {
        await client.connect();
        db = client.db(dbName);
        collection = db.collection<Configuration>('configurations');
    }

    return collection;
};

export default getCollection;
