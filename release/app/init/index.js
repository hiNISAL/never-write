"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const init = (root) => {
    const dir = fs_extra_1.default.readdirSync(root);
    if (!dir.length) {
        fs_extra_1.default.copySync(path_1.default.resolve(__dirname, '../../../templates/neverw-hello-template'), root);
        console.log('[INFO] 🎉 done.');
        console.log('[INFO] now can run command `neverw build` to generate posts.');
    }
    else {
        console.log('[INFO] ❌ directory must be empty.');
    }
};
exports.init = init;
