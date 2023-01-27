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
Object.defineProperty(exports, "__esModule", { value: true });
exports.build = void 0;
const get_config_1 = require("../../helpers/get-config");
const generator_1 = require("../../helpers/generator");
const build = (root) => __awaiter(void 0, void 0, void 0, function* () {
    const baseConfig = (0, get_config_1.getConfig)(root);
    yield (0, generator_1.generator)(root, baseConfig);
    const overedAt = Date.now();
    console.log(`\n[info] 🎉 done. used ${overedAt - globalThis.__app_started_at}ms.`);
});
exports.build = build;
