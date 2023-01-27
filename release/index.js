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
const yargs_1 = __importDefault(require("yargs/yargs"));
const helpers_1 = require("yargs/helpers");
const path_1 = __importDefault(require("path"));
const init_1 = require("./app/init");
const build_1 = require("./app/build");
const pkg = require('../package.json');
globalThis.__app_started_at = Date.now();
const argv = (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).argv;
const root = argv.root ? path_1.default.resolve(process.cwd(), argv.root) : process.cwd();
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (argv.init) {
        (0, init_1.init)(root);
        return;
    }
    if ((argv._ || []).includes('build')) {
        (0, build_1.build)(root);
        return;
    }
    console.log('[info] never-write');
    console.log(`[info] v${pkg.version}`);
    console.log(`[info] \`neverw --init\` to generate sample files`);
    console.log(`[info] \`neverw build\` to generate posts`);
    console.log(`[info] https://github.com/hiNISAL/never-write to known more about nerver-write\n`);
}))();
