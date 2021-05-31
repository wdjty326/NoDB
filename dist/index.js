"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
        if (!fs_1.default.existsSync(JSON_FILE_PATH))
            fs_1.default.mkdirSync(JSON_FILE_PATH);
    }
    NoDB.getInstance = function () {
        if (this.instance === null)
            this.instance = new NoDB();
        return this.instance;
    };
    NoDB.prototype.readFile = function (fileName) {
        return new Promise(function (resolve) {
            // 파일 형식은 json 형식으로 가져갑니다.
            fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
            var filePath = path_1.default.resolve(JSON_FILE_PATH, fileName);
            if (!fs_1.default.existsSync(filePath))
                throw Error("File not found::" + fileName);
            var str = fs_1.default.readFileSync(filePath, { encoding: "utf-8" });
            var data = JSON.parse(str);
            var primary = Object.keys(data.header).filter(function (k) { return data.header[k].primary; });
            resolve({ filePath: filePath, data: data, primary: primary });
        });
    };
    // 신규 데이터 파일을 생성합니다.
    NoDB.prototype.createFile = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        // 파일 형식은 json 형식으로 가져갑니다.
        fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
        var filePath = path_1.default.resolve(JSON_FILE_PATH, fileName);
        if (fs_1.default.existsSync(filePath))
            throw Error("File already exists::" + fileName);
        var header = {};
        args.forEach(function (v) {
            if (typeof v === "string")
                header[v] = {};
            else
                header[v.name] = { primary: v.primary, };
        });
        fs_1.default.writeFileSync(filePath, JSON.stringify({ header: header, data: [] }), { encoding: "utf-8" });
    };
    // 데이터 파일 헤더를 변경합니다.
    NoDB.prototype.updateFile = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.readFile(fileName)
            .then(function (_a) {
            var filePath = _a.filePath, data = _a.data, primary = _a.primary;
            var header = {};
            args.forEach(function (v) {
                if (typeof v === "string")
                    header[v] = {};
                else
                    header[v.name] = { primary: v.primary, };
            });
            fs_1.default.writeFileSync(filePath, JSON.stringify(__assign(__assign({}, data), {
                header: __assign(__assign({}, data.header), header),
            })), { encoding: "utf-8" });
        });
    };
    // 데이터 파일을 제거합니다.
    NoDB.prototype.deleteFile = function (fileName) {
        // 파일 형식은 json 형식으로 가져갑니다.
        fileName = !/\.(json)$/.test(fileName) ? fileName + ".json" : fileName;
        var filePath = path_1.default.resolve(JSON_FILE_PATH, fileName);
        if (fs_1.default.existsSync(filePath))
            fs_1.default.rmSync(filePath);
    };
    // 신규 데이터를 추가합니다.
    NoDB.prototype.insertData = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.readFile(fileName)
            .then(function (_a) {
            var _b;
            var filePath = _a.filePath, data = _a.data, primary = _a.primary;
            if (data.data.some(function (v) {
                var idx = args.findIndex(function (x) { return primary.some(function (y) { return (x[y] === v[y]); }); });
                return idx > -1;
            }))
                throw Error("Already Primary key");
            (_b = data.data).push.apply(_b, args);
            fs_1.default.writeFileSync(filePath, JSON.stringify(data), { encoding: "utf-8" });
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    // 데이터를 업데이트합니다. primary 가 없으면 업데이트를 하지 않습니다.
    NoDB.prototype.updateData = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.readFile(fileName)
            .then(function (_a) {
            var filePath = _a.filePath, data = _a.data, primary = _a.primary;
            data.data = data.data.map(function (v) {
                var idx = args.findIndex(function (x) { return primary.some(function (y) { return (x[y] === v[y]); }); });
                if (idx > -1)
                    Object.keys(args[idx]).forEach(function (k) { return (v[k] = args[idx][k]); });
                return v;
            });
            fs_1.default.writeFileSync(filePath, JSON.stringify(data), { encoding: "utf-8" });
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    // 데이터를 제거합니다. primary 가 없으면 제거하지 않습니다.
    NoDB.prototype.deleteData = function (fileName) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        this.readFile(fileName)
            .then(function (_a) {
            var filePath = _a.filePath, data = _a.data, primary = _a.primary;
            data.data = data.data.filter(function (v) {
                var idx = args.findIndex(function (x) { return primary.some(function (y) { return (x[y] === v[y]); }); });
                return idx === -1;
            });
            fs_1.default.writeFileSync(filePath, JSON.stringify(data), { encoding: "utf-8" });
        })
            .catch(function (e) {
            console.error(e);
        });
    };
    NoDB.prototype.selectOne = function (fileName, fn) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.readFile(fileName)
                .then(function (_a) {
                var data = _a.data;
                data.data = data.data.filter(function (v) { return fn(v); });
                if (data.data.length)
                    resolve(data.data[0]);
                else
                    reject(new Error("Not Data"));
            })
                .catch(function (e) {
                reject(e);
            });
        });
    };
    NoDB.prototype.select = function (fileName, fn) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.readFile(fileName)
                .then(function (_a) {
                var data = _a.data;
                data.data = data.data.filter(function (v) { return fn(v); });
                resolve(data.data);
            })
                .catch(function (e) {
                reject(e);
            });
        });
    };
    NoDB.instance = null;
    return NoDB;
}());
exports.default = NoDB;
