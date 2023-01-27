"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultConfig = void 0;
exports.defaultConfig = {
    site: {
        name: '',
        desc: '',
        pageSize: 15,
    },
    build: {
        outDir: './dist',
        publicPath: '/',
        postsRootPath: './posts',
        publicResourcePath: '',
    },
    render: {
        template: {
            index: '',
            post: '',
        },
        dateFormatter: 'YYYY/MM/DD hh:mm:ss',
    },
};
