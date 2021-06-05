import path from "path";
import fs from "fs";

import { NoDBContent, HeaderOption, FileHeader } from "./interface";

const JSON_FILE_PATH = path.resolve(__dirname, "db");

// filestream 을 사용하여 db를 구현합니다.
class NoDB {
	private static instance: NoDB | null = null;
	public static getInstance(): NoDB {
		if (this.instance === null)
			this.instance = new NoDB();
		return this.instance;
	}

	constructor() {
		if (!fs.existsSync(JSON_FILE_PATH)) fs.mkdirSync(JSON_FILE_PATH);
	}

	private readFile<T extends { [key: string]: any }>(fileName: string): Promise<{
		filePath: string;
		data: NoDBContent<T>;
		primary: string[];
	}> {
		return new Promise((resolve) => {
			// 파일 형식은 json 형식으로 가져갑니다.
			fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
			const filePath = path.resolve(JSON_FILE_PATH, fileName);

			if (!fs.existsSync(filePath)) throw Error("File not found::" + fileName);

			const str = fs.readFileSync(filePath, { encoding: "utf-8" });
			const data = JSON.parse(str) as NoDBContent<T>;
			const primary = Object.keys(data.header).filter((k) => data.header[k].primary);

			resolve({ filePath, data, primary });
		});
	}

	// 신규 데이터 파일을 생성합니다.
	public createFile(fileName: string, ...args: (HeaderOption | string)[]) {
		// 파일 형식은 json 형식으로 가져갑니다.
		fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
		const filePath = path.resolve(JSON_FILE_PATH, fileName);

		if (fs.existsSync(filePath)) throw Error("File already exists::" + fileName);

		const header: FileHeader = {};
		args.forEach((v) => {
			if (typeof v === "string") header[v] = {};
			else header[v.name] = { primary: v.primary, };
		});

		fs.writeFileSync(filePath, JSON.stringify({ header, data: [] }), { encoding: "utf-8" });
	}

	// 데이터 파일 헤더를 변경합니다.
	public updateFile(fileName: string, ...args: (HeaderOption | string)[]) {
		this.readFile(fileName)
			.then(({ filePath, data, primary }) => {
				const header: FileHeader = {};
				args.forEach((v) => {
					if (typeof v === "string") header[v] = { };
					else header[v.name] = { primary: v.primary, };
				});

				fs.writeFileSync(filePath, JSON.stringify({
					...data,
					...{
						header: {
							...data.header,
							...header,
						},
					},
				}), { encoding: "utf-8" });
			});
	}

	// 데이터 파일을 제거합니다.
	public deleteFile(fileName: string) {
		// 파일 형식은 json 형식으로 가져갑니다.
		fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
		const filePath = path.resolve(JSON_FILE_PATH, fileName);
		if (fs.existsSync(filePath)) fs.rmSync(filePath);
	}

	// 신규 데이터를 추가합니다.
	public insertData<T extends { [key: string]: any }>(fileName: string, ...args: T[]) {
		this.readFile<T>(fileName)
			.then(({ filePath, data, primary }) => {
				if (data.data.some((v) => {
					const idx = args.findIndex((x) => primary.some((y) => ((x as any)[y] === (v as any)[y])));
					return idx > -1;
				})) throw Error("Already Primary key");

				data.data.push(...args);
				fs.writeFileSync(filePath, JSON.stringify(data), { encoding: "utf-8" });
			})
			.catch((e) => {
				console.error(e);
			});
	}

	// 데이터를 업데이트합니다. primary 가 없으면 업데이트를 하지 않습니다.
	public updateData<T extends { [key: string]: any }>(fileName: string, ...args: T[]) {
		this.readFile<T>(fileName)
			.then(({ filePath, data, primary }) => {
				data.data = data.data.map((v) => {
					const idx = args.findIndex((x) => primary.some((y) => (x[y] === v[y])));
					if (idx > -1)
						Object.keys(args[idx]).forEach((k) => ((v as any)[k] = args[idx][k]));
					return v;
				});

				fs.writeFileSync(filePath, JSON.stringify(data), { encoding: "utf-8" });
			})
			.catch((e) => {
				console.error(e);
			});
	}

	// 데이터를 제거합니다. primary 가 없으면 제거하지 않습니다.
	public deleteData<T extends { [key: string]: any }>(fileName: string, ...args: T[]) {
		this.readFile<T>(fileName)
			.then(({ filePath, data, primary }) => {
				data.data = data.data.filter((v) => {
					const idx = args.findIndex((x) => primary.some((y) => (x[y] === v[y])));
					return idx === -1;
				});

				fs.writeFileSync(filePath, JSON.stringify(data), { encoding: "utf-8" });
			})
			.catch((e) => {
				console.error(e);
			});
	}

	public selectOne<T extends { [key: string]: any }>(fileName: string, fn: (data: T) => boolean) {
		return new Promise<T>((resolve, reject) => {
			this.readFile<T>(fileName)
				.then(({ data }) => {
					data.data = data.data.filter((v) => fn(v));
					if (data.data.length) resolve(data.data[0]);
					else reject(new Error("Not Data"));
				})
				.catch((e) => {
					reject(e);
				});
		});
	}

	public select<T extends { [key: string]: any }>(fileName: string, fn: (data: T) => boolean) {
		return new Promise<T[]>((resolve, reject) => {
			this.readFile<T>(fileName)
				.then(({ data }) => {
					data.data = data.data.filter((v) => fn(v));
					resolve(data.data);
				})
				.catch((e) => {
					reject(e);
				});
		});
	}
}

export default NoDB;
