import path from "path";
import fs from "fs";

import { NoDBContent, HeaderOption, FileHeader } from "interface";

const JSON_FILE_PATH = path.resolve(__dirname, "db");

// filestream 을 사용하여 db를 구현합니다.
class NoDB {
	private static instance: NoDB | null = null;
	public static getInstance (): NoDB {
		if (this.instance === null)
			this.instance = new NoDB();
		return this.instance;
	}

	// 신규 데이터 파일을 생성합니다.
	public createFile (fileName: string, ...args: (HeaderOption | string)[]) {
		// 파일 형식은 json 형식으로 가져갑니다.
		fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
		const fullFileName = path.resolve(JSON_FILE_PATH, fileName);

		if (!fs.existsSync(JSON_FILE_PATH)) fs.mkdirSync(JSON_FILE_PATH);
		if (fs.existsSync(fullFileName)) throw Error("File already exists::" + fileName);

		const header: FileHeader = {};
		args.forEach((v) => {
			if (typeof v === "string") header[v] = { type: "string", };
			else header[v.name] = { type: v.type, primary: v.primary, };
		})

		fs.writeFileSync(fullFileName, JSON.stringify({header, data: []}), { encoding: "utf-8" });
	}

	// 신규 데이터를 추가합니다.
	public insertData<T extends any> (fileName: string, ...args: T[]) {
		// 파일 형식은 json 형식으로 가져갑니다.
		fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
		const fullFileName = path.resolve(JSON_FILE_PATH, fileName);

		if (!fs.existsSync(JSON_FILE_PATH) || !fs.existsSync(fullFileName)) throw Error("File not found::" + fileName);
		const str = fs.readFileSync(fullFileName, { encoding: "utf-8" });
		const data = JSON.parse(str) as NoDBContent<T>;

		const primary: string[] = [];
		Object.keys(data.header).forEach((k) => data.header[k].primary && primary.push(k));

		if (data.data.some((v) => {
			const idx = args.findIndex((x) => primary.some((y) => ((x as any)[y] === (v as any)[y])));
			return idx > -1;
		})) throw Error("Already Primary key");

		data.data.push(...args);
		fs.writeFileSync(fullFileName, JSON.stringify(data), { encoding: "utf-8" });
	}

	// 데이터를 업데이트합니다. primary 가 없으면 업데이트를 하지 않습니다.
	public updateData<T extends {[key: string]: any}> (fileName: string, ...args: T[]) {
		// 파일 형식은 json 형식으로 가져갑니다.
		fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
		const fullFileName = path.resolve(JSON_FILE_PATH, fileName);

		if (!fs.existsSync(JSON_FILE_PATH) || !fs.existsSync(fullFileName)) throw Error("File not found::" + fileName);
		const str = fs.readFileSync(fullFileName, { encoding: "utf-8" });
		const data = JSON.parse(str) as NoDBContent<T>;

		const primary: string[] = [];
		Object.keys(data.header).forEach((k) => data.header[k].primary && primary.push(k));

		data.data = data.data.map((v) => {
			const idx = args.findIndex((x) => primary.some((y) => (x[y] === v[y])));
			if (idx > -1)
				Object.keys(args[idx]).forEach((k) => ((v as any)[k] = args[idx][k]));			
			return v;
		});

		fs.writeFileSync(fullFileName, JSON.stringify(data), { encoding: "utf-8" });
	}

	// 데이터를 제거합니다. primary 가 없으면 제거하지 않습니다.
	public deleteData<T extends {[key: string]: any}> (fileName: string, ...args: T[]) {
		// 파일 형식은 json 형식으로 가져갑니다.
		fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
		const fullFileName = path.resolve(JSON_FILE_PATH, fileName);

		if (!fs.existsSync(JSON_FILE_PATH) || !fs.existsSync(fullFileName)) throw Error("File not found::" + fileName);
		const str = fs.readFileSync(fullFileName, { encoding: "utf-8" });
		const data = JSON.parse(str) as NoDBContent<T>;

		const primary: string[] = [];
		Object.keys(data.header).forEach((k) => data.header[k].primary && primary.push(k));

		data.data = data.data.filter((v) => {
			const idx = args.findIndex((x) => primary.some((y) => (x[y] === v[y])));
			return idx === -1;
		});

		fs.writeFileSync(fullFileName, JSON.stringify(data), { encoding: "utf-8" });
	}
}

export default NoDB;
