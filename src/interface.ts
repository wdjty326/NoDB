export interface HeaderColume {
	// type: string | number | boolean;
	primary?: boolean;
}

export interface HeaderOption extends HeaderColume {
	name: string;
}

export type FileHeader = { [key: string]: HeaderColume; };

export interface NoDBContent<T> {
	header: FileHeader;
	data: T[];
}
