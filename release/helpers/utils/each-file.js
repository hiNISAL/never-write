"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEachFilePath = exports.eachFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const eachFile = (root, callback) => __awaiter(void 0, void 0, void 0, function* () {
    const list = fs_1.default.readdirSync(root);
    for (let i = 0, len = list.length; i < len; i++) {
        const name = list[i];
        const dir = path_1.default.resolve(root, name);
        if (fs_1.default.statSync(dir).isDirectory()) {
            yield (0, exports.eachFile)(dir, callback);
            continue;
        }
        yield callback({
            dir,
            root,
        });
    }
});
exports.eachFile = eachFile;
const getEachFilePath = (root) => {
    const arr = [];
    const each = (root) => {
        const list = fs_1.default.readdirSync(root);
        list.forEach((name) => {
            const dir = path_1.default.resolve(root, name);
            if (fs_1.default.statSync(dir).isDirectory()) {
                each(dir);
                return;
            }
            arr.push({
                dir,
                root,
            });
        });
    };
    each(root);
    return arr;
};
exports.getEachFilePath = getEachFilePath;
