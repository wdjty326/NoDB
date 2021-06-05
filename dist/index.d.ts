import { HeaderOption } from "./interface";
declare class NoDB {
    private static instance;
    static getInstance(): NoDB;
    constructor();
    private readFile;
    createFile(fileName: string, ...args: (HeaderOption | string)[]): void;
    updateFile(fileName: string, ...args: (HeaderOption | string)[]): void;
    deleteFile(fileName: string): void;
    insertData<T extends {
        [key: string]: any;
    }>(fileName: string, ...args: T[]): void;
    updateData<T extends {
        [key: string]: any;
    }>(fileName: string, ...args: T[]): void;
    deleteData<T extends {
        [key: string]: any;
    }>(fileName: string, ...args: T[]): void;
    selectOne<T extends {
        [key: string]: any;
    }>(fileName: string, fn: (data: T) => boolean): Promise<T>;
    select<T extends {
        [key: string]: any;
    }>(fileName: string, fn: (data: T) => boolean): Promise<T[]>;
}
export default NoDB;
