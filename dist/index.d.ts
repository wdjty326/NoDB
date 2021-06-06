import { HeaderOption } from "./interface";
declare class NoDB {
    private static instance;
    static getInstance(): NoDB;
    constructor();
    private readFile;
    createFile(fileName: string, ...args: (HeaderOption | string)[]): Promise<void>;
    updateFile(fileName: string, ...args: (HeaderOption | string)[]): Promise<void>;
    deleteFile(fileName: string): Promise<void>;
    insertData<T extends {
        [key: string]: any;
    }>(fileName: string, ...args: T[]): Promise<void>;
    updateData<T extends {
        [key: string]: any;
    }>(fileName: string, ...args: T[]): Promise<void>;
    deleteData<T extends {
        [key: string]: any;
    }>(fileName: string, ...args: T[]): Promise<void>;
    selectOne<T extends {
        [key: string]: any;
    }>(fileName: string, fn: (data: T) => boolean): Promise<T>;
    select<T extends {
        [key: string]: any;
    }>(fileName: string, fn: (data: T) => boolean): Promise<T[]>;
}
export default NoDB;
