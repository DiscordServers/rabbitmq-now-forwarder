import {Collection, Db, MongoClient} from 'mongodb';

const client = new MongoClient(process.env.MONGO_URL);
const dbName = process.env.COLLECTION || 'production';

let db: Db;

type names = 'configurations' | 'instances';

const getCollection = async <T>(name: names): Promise<Collection<T>> => {
    if (!client.isConnected()) {
        await client.connect();
        db = client.db(dbName);
    }

    return db.collection<T>(name);
};

export default getCollection;
