import DbAdapterFactory, { Databases } from "./DbAdapters/DbAdapterFactory";

type configType = {
    DB_CONNECTION_STRING: string,
    SERVER_NAME: string,
    EMAIL_ID: string,
    EMAIL_TOKEN: string,
    JWT_SECRET: string,
    BCRYPT_SALT: string,
}

var dbAdapter: DbAdapter | null = null;

var config: configType | null = null;

async function AuthenticatorConfig(
    db_str: string, server_name: string, 
    email_id: string, email_token: string, 
    jwt_secret: string, bcrypt_salt: string
    ) {
    config = {
        DB_CONNECTION_STRING: db_str,
        SERVER_NAME: server_name,
        EMAIL_ID: email_id,
        EMAIL_TOKEN: email_token,
        JWT_SECRET: jwt_secret,
        BCRYPT_SALT: bcrypt_salt
    }
    
    dbAdapter = await DbAdapterFactory.getDbConnection(Databases.MongoDB, {
        uri: config.DB_CONNECTION_STRING
    });
}

async function SmoothExit() {
    await dbAdapter?.close();
}

export {
    dbAdapter,
    config,
    SmoothExit
}

export default AuthenticatorConfig;