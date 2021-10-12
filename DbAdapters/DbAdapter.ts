interface DbAdapter {
    connect(): Promise<void>;
    close(): Promise<void>;
    claerDb(): Promise<void>;
    checkExists(query: any): Promise<string | null>;
    getValues(filter: any, fields?: string[]): Promise<null | any>;
    insert(document: any): Promise<string | any>;
    update(filter: any, values: any): Promise<boolean>;
}