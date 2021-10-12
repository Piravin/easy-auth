import MongoDBAdapter from "./MongoDBAdapter";

export enum Databases {
    MongoDB
};

class DbAdapterFactory {
    static async getDbConnection(dbtype: Databases, options: any) {
        switch (dbtype) {
            case Databases.MongoDB:
                const db = await new MongoDBAdapter(options.uri);
                await db.connect();
                return db;
            
            default:
                return null;
        }
    }
}

export default DbAdapterFactory;