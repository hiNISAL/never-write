"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = exports.DEFAULT_EJS_TEMPLATE = void 0;
exports.DEFAULT_EJS_TEMPLATE = 'cactus-dark';
exports.defaultConfig = {
    site: {
        name: '',
        desc: '',
    },
    build: {
        outDir: './dist',
        publicPath: '/',
        postsRootPath: './posts',
        publicResourcePath: '',
        hook: '',
        htmlMinify: true,
    },
    render: {
        footerText: '',
        pageSize: 15,
        template: exports.DEFAULT_EJS_TEMPLATE,
        dateFormatter: 'YYYY/MM/DD hh:mm:ss',
        summaryLength: 100,
    },
};
