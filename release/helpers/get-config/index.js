"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConfig = void 0;
const yaml_1 = __importDefault(require("yaml"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const lodash_1 = require("lodash");
const config_1 = require("./config");
const CONFIG_NAME = 'never-write.yaml';
const getConfig = (root) => {
    try {
        // -------------------------------------------------------------------------
        // read config file
        const file = fs_1.default.readFileSync(path_1.default.resolve(root, CONFIG_NAME), 'utf-8');
        const baseConfig = (0, lodash_1.cloneDeep)(config_1.defaultConfig);
        const userConfig = yaml_1.default.parse(file) || {};
        // -------------------------------------------------------------------------
        // merge default config
        (0, lodash_1.assign)(baseConfig.build, userConfig.build);
        (0, lodash_1.assign)(baseConfig.render, userConfig.render);
        (0, lodash_1.assign)(baseConfig.site, userConfig.site);
        return baseConfig;
    }
    catch (err) {
        // -------------------------------------------------------------------------
        // must need never-write config
        // its mean current directory is never-write workspace
        console.log('[INFO] ❌ missing `never-wite.yaml` file\n');
        console.log('[INFO] run command `neverw --init` to generate sample files\n');
        throw err;
    }
};
exports.getConfig = getConfig;
