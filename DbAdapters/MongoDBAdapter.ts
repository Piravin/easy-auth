import {Collection, Db, MongoClient, ObjectID} from "mongodb";

interface User {
    _id: string,
    name: string,
    email: string,
    password: string,
    verified: boolean,
    extraData?: any
}

class MongoDBAdapter implements DbAdapter {

    private client: MongoClient;
    private db: Db | undefined;
    private collection: Collection<User> | undefined;

    constructor(uri: string) {
        this.client = new MongoClient(uri);
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db("accounts");
        this.collection = this.db.collection<User>("users");
    }

    async close() {
        await this.client.close();
    }

    async claerDb() {
        await this.collection?.deleteMany({});
    }

    async checkExists(query: any){

        if (Object.keys(query).includes("_id")) {
            query["_id"] = new ObjectID(query["_id"]);
        }
        const user = await this.collection!.findOne(query, {projection: {_id: 1}});
        return user !== null ? user._id.toString() : null;

    }
    
    async getValues(filter: any, fields?: string[]) {

        let projections: any = {_id: 1};
        fields?.forEach(field => projections[field] = 1);
        if (Object.keys(filter).includes("_id")) {
            filter["_id"] = new ObjectID(filter["_id"]);
        }
        const document = await this.collection!.findOne(filter, {projection: projections});
        if (document !== null && Object.keys(document!).includes("_id")) {
            document["_id"] = document._id.toString();
        }

        return document;

    }

    async insert(document: any) {
        
        const result = await this.collection?.insertOne(document);
        return result?.insertedId.toString();

    }

    async update(filter: any, values: any) {

        if (Object.keys(filter).includes("_id")) {
            filter["_id"] = new ObjectID(filter["_id"]);
        }

        const result = await this.collection?.updateOne(filter, { $set: {...values},});
        return result!.modifiedCount === 1;

    }

}

export default MongoDBAdapter;