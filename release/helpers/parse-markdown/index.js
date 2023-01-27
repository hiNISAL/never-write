"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMarkdown = void 0;
const markdown_it_1 = __importDefault(require("markdown-it"));
const mdMeta = require('markdown-it-meta');
const md = new markdown_it_1.default();
md.use(mdMeta);
md.use(require('markdown-it-highlightjs'), {
    register: {
        cypher: require('highlightjs-cypher')
    }
});
const parseMarkdown = (mdString) => {
    const content = md.render(mdString);
    const returns = {
        content,
        meta: JSON.parse(JSON.stringify(md.meta)),
    };
    md.meta = {};
    return returns;
};
exports.parseMarkdown = parseMarkdown;
