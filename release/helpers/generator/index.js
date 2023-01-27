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
exports.generator = void 0;
const path_1 = __importDefault(require("path"));
const parse_markdown_1 = require("../parse-markdown");
const each_file_1 = require("../utils/each-file");
const lodash_1 = require("lodash");
const dayjs_1 = __importDefault(require("dayjs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const ejs_1 = __importDefault(require("ejs"));
const cheerio_1 = __importDefault(require("cheerio"));
const config_1 = require("../get-config/config");
// -------------------------------------------------------------------------
const presetTemplates = {
    plain: '../../../templates/theme/plain',
    'plain-dark': '../../../templates/theme/plain-dark',
};
// -------------------------------------------------------------------------
// generate posts
const generator = (root, config) => __awaiter(void 0, void 0, void 0, function* () {
    const { build, site, render: renderConfig } = config;
    const { outDir } = build;
    const { pageSize } = renderConfig;
    const distDir = path_1.default.resolve(root, outDir);
    const postsRoot = path_1.default.resolve(root, build.postsRootPath);
    const postTemplate = (() => {
        let filePath = '';
        if ((0, lodash_1.isString)(renderConfig.template)) {
            filePath = path_1.default.resolve(__dirname, `${presetTemplates[renderConfig.template]}/post.html`);
        }
        else if (renderConfig.template.post) {
            filePath = path_1.default.join(root, renderConfig.template.post);
        }
        else {
            filePath = path_1.default.resolve(__dirname, `${presetTemplates[config_1.DEFAULT_EJS_TEMPLATE]}/post.html`);
        }
        try {
            return fs_extra_1.default.readFileSync(filePath, 'utf-8');
        }
        catch (err) {
            console.log(`[INFO] ❌ missing template: ${filePath}`);
            throw err;
        }
    })();
    const indexedTemplate = (() => {
        let filePath = '';
        if ((0, lodash_1.isString)(renderConfig.template)) {
            filePath = path_1.default.resolve(__dirname, `${presetTemplates[renderConfig.template]}/index.html`);
        }
        else if (renderConfig.template.index) {
            filePath = path_1.default.join(root, renderConfig.template.index);
        }
        else {
            filePath = path_1.default.resolve(__dirname, `${presetTemplates[config_1.DEFAULT_EJS_TEMPLATE]}/index.html`);
        }
        try {
            return fs_extra_1.default.readFileSync(filePath, 'utf-8');
        }
        catch (err) {
            console.log(`[INFO] ❌ missing template: ${filePath}`);
            throw err;
        }
    })();
    const hook = (() => {
        if (build.hook) {
            try {
                return require(path_1.default.join(root, build.hook));
            }
            catch (err) {
                console.log(`[INFO] ❌ missing hook file: ${build.hook}`);
                throw err;
            }
        }
        return {};
    })();
    // let outs: Out[] = [];
    // -------------------------------------------------------------------------
    // got each post meta
    const sourceMarkdownFiles = (0, each_file_1.getEachFilePath)(postsRoot)
        .filter(({ dir }) => {
        return dir.endsWith('.md');
    });
    let outs = sourceMarkdownFiles
        // -------------------------------------------------------------------------
        // make each post configuration
        // if some day its slow, can use multi thread
        .map(({ dir }) => {
        var _a;
        const sourceStat = fs_extra_1.default.statSync(dir);
        const str = fs_extra_1.default.readFileSync(dir, 'utf-8');
        const { content: md, meta, } = (0, parse_markdown_1.parseMarkdown)(str);
        const relativePath = path_1.default.relative(postsRoot, dir);
        const dirChunk = relativePath.split('/');
        const [filename] = (_a = dirChunk.pop()) === null || _a === void 0 ? void 0 : _a.split('.');
        const relativeDir = dirChunk.join('/');
        const postSavedDir = path_1.default.resolve(distDir, relativeDir);
        const savedFilename = `${filename}.html`;
        const $ = cheerio_1.default.load(md);
        const textContent = (0, lodash_1.trim)($.text());
        const postRelativePathInSite = path_1.default.join(relativeDir, savedFilename);
        const out = {
            meta,
            relativePath: postRelativePathInSite,
            sourceFileStat: sourceStat,
            filename: savedFilename,
            filenameWithoutExt: filename,
            site: config.site,
            html: md,
            dateFormat: {
                mtime: (0, dayjs_1.default)(sourceStat.mtime).format(renderConfig.dateFormatter),
            },
            text: textContent,
            summary: textContent.length > renderConfig.summaryLength
                ? (`${textContent.substring(0, renderConfig.summaryLength)}...`)
                : textContent,
            postSavedDir,
            postSavedFullPath: path_1.default.resolve(postSavedDir, savedFilename),
            staticPath: `${build.publicPath}${postRelativePathInSite}`,
        };
        return out;
    });
    // -------------------------------------------------------------------------
    // default is sort by modify time
    outs = hook.sortBy
        ? outs.sort(hook.sortBy)
        : outs.sort((a, b) => {
            const mTimeA = a.sourceFileStat.mtime.getTime();
            const mTimeB = b.sourceFileStat.mtime.getTime();
            return mTimeB - mTimeA;
        });
    // -------------------------------------------------------------------------
    // generate each post
    for (let idx = 0, len = outs.length; idx < len; idx++) {
        const post = outs[idx];
        const html = ejs_1.default.render(postTemplate, (0, lodash_1.assign)(post, {
            prevPost: outs[idx - 1],
            nextPost: outs[idx + 1],
        }));
        if (hook.eachBeforeRenderPost) {
            yield hook.eachBeforeRenderPost(post);
        }
        console.log(`[info] saving ${post.relativePath}`);
        // make sure has dir
        yield fs_extra_1.default.mkdirp(post.postSavedDir);
        fs_extra_1.default.writeFile(post.postSavedFullPath, html);
        if (hook.eachAfterRenderPost) {
            yield hook.eachAfterRenderPost(post);
        }
    }
    // -------------------------------------------------------------------------
    // generate indexes
    const chunks = (0, lodash_1.chunk)(outs, pageSize);
    const totalCount = outs.length;
    for (let pageIndex = 0, len = chunks.length; pageIndex < len; pageIndex++) {
        const chunk = chunks[pageIndex];
        const page = pageIndex + 1;
        const options = {
            posts: chunk,
            page,
            pageTotal: len,
            totalCount,
            selfPath: `/page/${page}.html`,
            prevPagePath: page === 2
                ? '/index.html'
                : `/page/${page - 1}.html`,
            nextPagePath: `/page/${page + 1}.html`,
            selfStaticPath: `${build.publicPath}page/${page}.html`,
            prevPageStaticPath: page === 2
                ? `${build.publicPath}index.html`
                : `${build.publicPath}page/${page - 1}.html`,
            nextPageStaticPath: `${build.publicPath}page/${page + 1}.html`,
            isFirstPage: page === 1,
            isEndPage: page === len,
            site: config.site,
        };
        const postListHtml = ejs_1.default.render(indexedTemplate, options);
        let filename = 'index.html';
        let pathPrefix = '/';
        if (pageIndex !== 0) {
            filename = `${page}.html`;
            pathPrefix = '/page/';
        }
        const storeRoot = path_1.default.join(distDir, pathPrefix);
        const hookOptions = Object.assign(Object.assign({}, options), { html: postListHtml, storeRoot,
            filename,
            pathPrefix });
        if (hook.eachBeforeRenderIndexes) {
            hook.eachBeforeRenderIndexes(hookOptions);
        }
        yield fs_extra_1.default.mkdirp(storeRoot);
        console.log(`[info] saving ${path_1.default.join(pathPrefix, filename)}`);
        fs_extra_1.default.writeFileSync(path_1.default.join(storeRoot, filename), postListHtml);
        if (hook.eachAfterRenderIndexes) {
            hook.eachAfterRenderIndexes(hookOptions);
        }
    }
    // -------------------------------------------------------------------------
    // copy public resource to dist root
    if (build.publicResourcePath) {
        try {
            const publicResourcePath = path_1.default.resolve(root, build.publicResourcePath);
            fs_extra_1.default.statSync(publicResourcePath);
            fs_extra_1.default.copySync(publicResourcePath, path_1.default.resolve(distDir, build.publicResourcePath));
        }
        catch (err) {
            throw err;
        }
    }
    else {
        // -------------------------------------------------------------------------
        // default copy `${root}/public` to `${dist}/public`
        const defaultPublicResourcePath = './public';
        try {
            const publicResourcePath = path_1.default.resolve(root, defaultPublicResourcePath);
            fs_extra_1.default.copySync(publicResourcePath, path_1.default.resolve(distDir, defaultPublicResourcePath));
        }
        catch (_a) { }
    }
});
exports.generator = generator;
