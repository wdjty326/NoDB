"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var JSON_FILE_PATH = path_1.default.resolve(__dirname, "db");
// filestream 을 사용하여 db를 구현합니다.
var NoDB = /** @class */ (function () {
    function NoDB() {
    }
    NoDB.getInstance = function () {
        if (this.instance === null)
            this.instance = new NoDB();
        return this.instance;
    };
    // 신규 데이터 파일을 생성합니다.
    NoDB.prototype.createFile = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // 파일 형식은 json 형식으로 가져갑니다.
        fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
        var fullFileName = path_1.default.resolve(JSON_FILE_PATH, fileName);
        if (!fs_1.default.existsSync(JSON_FILE_PATH))
            fs_1.default.mkdirSync(JSON_FILE_PATH);
        if (fs_1.default.existsSync(fullFileName))
            throw Error("File already exists::" + fileName);
        var header = {};
        args.forEach(function (v) {
            if (typeof v === "string")
                header[v] = { type: "string", };
            else
                header[v.name] = { type: v.type, primary: v.primary, };
        });
        fs_1.default.writeFileSync(fullFileName, JSON.stringify({ header: header, data: [] }), { encoding: "utf-8" });
    };
    // 신규 데이터를 추가합니다.
    NoDB.prototype.insertData = function (fileName) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // 파일 형식은 json 형식으로 가져갑니다.
        fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
        var fullFileName = path_1.default.resolve(JSON_FILE_PATH, fileName);
        if (!fs_1.default.existsSync(JSON_FILE_PATH) || !fs_1.default.existsSync(fullFileName))
            throw Error("File not found::" + fileName);
        var str = fs_1.default.readFileSync(fullFileName, { encoding: "utf-8" });
        var data = JSON.parse(str);
        var primary = [];
        Object.keys(data.header).forEach(function (k) { return data.header[k].primary && primary.push(k); });
        if (data.data.some(function (v) {
            var idx = args.findIndex(function (x) { return primary.some(function (y) { return (x[y] === v[y]); }); });
            return idx > -1;
        }))
            throw Error("Already Primary key");
        (_a = data.data).push.apply(_a, args);
        fs_1.default.writeFileSync(fullFileName, JSON.stringify(data), { encoding: "utf-8" });
    };
    // 데이터를 업데이트합니다. primary 가 없으면 업데이트를 하지 않습니다.
    NoDB.prototype.updateData = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // 파일 형식은 json 형식으로 가져갑니다.
        fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
        var fullFileName = path_1.default.resolve(JSON_FILE_PATH, fileName);
        if (!fs_1.default.existsSync(JSON_FILE_PATH) || !fs_1.default.existsSync(fullFileName))
            throw Error("File not found::" + fileName);
        var str = fs_1.default.readFileSync(fullFileName, { encoding: "utf-8" });
        var data = JSON.parse(str);
        var primary = [];
        Object.keys(data.header).forEach(function (k) { return data.header[k].primary && primary.push(k); });
        data.data = data.data.map(function (v) {
            var idx = args.findIndex(function (x) { return primary.some(function (y) { return (x[y] === v[y]); }); });
            if (idx > -1)
                Object.keys(args[idx]).forEach(function (k) { return (v[k] = args[idx][k]); });
            return v;
        });
        fs_1.default.writeFileSync(fullFileName, JSON.stringify(data), { encoding: "utf-8" });
    };
    // 데이터를 제거합니다. primary 가 없으면 제거하지 않습니다.
    NoDB.prototype.deleteData = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // 파일 형식은 json 형식으로 가져갑니다.
        fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
        var fullFileName = path_1.default.resolve(JSON_FILE_PATH, fileName);
        if (!fs_1.default.existsSync(JSON_FILE_PATH) || !fs_1.default.existsSync(fullFileName))
            throw Error("File not found::" + fileName);
        var str = fs_1.default.readFileSync(fullFileName, { encoding: "utf-8" });
        var data = JSON.parse(str);
        var primary = [];
        Object.keys(data.header).forEach(function (k) { return data.header[k].primary && primary.push(k); });
        data.data = data.data.filter(function (v) {
            var idx = args.findIndex(function (x) { return primary.some(function (y) { return (x[y] === v[y]); }); });
            return idx === -1;
        });
        fs_1.default.writeFileSync(fullFileName, JSON.stringify(data), { encoding: "utf-8" });
    };
    NoDB.instance = null;
    return NoDB;
}());
exports.default = NoDB;
