export interface HeaderColume {
    primary?: boolean;
}
export interface HeaderOption extends HeaderColume {
    name: string;
}
export declare type FileHeader = {
    [key: string]: HeaderColume;
};
export interface NoDBContent<T> {
    header: FileHeader;
    data: T[];
}
