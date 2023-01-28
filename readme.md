# never-write

🇨🇳[中文](https://github.com/hiNISAL/never-write#never-wirte) | [ENGLISH](https://github.com/hiNISAL/never-write/blob/main/readme-en.md)


`never-write` 是一个基于 `markdown` 的静态站点生成工具。

## 安装

```shell
npm i never-write -g
```

## 使用

```shell
# 初始化，必须在空目录
neverw --init

# 生成
neverw build
```

## NEVERW --INIT

`neverw --init` 命令会生成一个基础模板。

```shell
# 所有文章、发布内容都写在 posts 目录下
- posts/
# 静态资源目录
- public/
# 配置文件
- never-write.yaml
```

所有文章都写在 `posts` 目录下，目前只会处理 `.md` 后缀的文件。

该目录可以在配置文件中重新制定(build.postsRootPath)。

## never-write.yaml

`never-write.yaml` 标记了当前目录为一个处理站点，所以所有配置的路径都要当对于配置文件所在的目录。

该配置可以自己创建，也可以用 `neverw --init` 生成。

```yaml
site:
  # 默认 空
  name: 站点名称
  # 默认 空
  desc: 站点描述

build:
  # 默认 ./dist
  outDir: 生成输出目录
  # 默认 /
  publicPath: 资源路径前缀
  # 默认 ./posts
  postsRootPath: markdown文件的查找根目录
  # 默认 ./public
  publicResourcePath: 静态资源，会直接拷贝到 outDir 下
  # 默认 无
  hook: 一些钩子，在文章、索引生成前后阶段调用
  # 默认 true
  htmlMinify: 是否压缩输出的html

render:
  # 可以传递字符串，为内部预设的主题
  # 如果传递对象，则会根据路径对应去找文件
  # 默认 plain-dark，目前可选 plain|plain-dark
  template:
    index: 索引页面模板
    post: 文章模板
    tagIndexes: 根据标签聚合的索引页面

  # 默认 15
  pageSize: 索引页一页的索引数量

  # 默认 YYYY/MM/DD hh:mm:ss
  dateFormatter: 会提前处理好一部分时间，方便模板里使用，处理的格式会按这个配置来

  # 默认 100
  summaryLength: 摘要的长度
```

默认配置

```yaml
site:
  name:
  desc:

build:
  outDir: ./dist
  publicPath: /
  postsRootPath: ./posts
  publicResourcePath: ./public
  htmlMinify: true
  hook:

render:
  template: plain-dark
  pageSize: 15
  dateFormatter: YYYY/MM/DD hh:mm:ss
  summaryLength: 100
```

## 注意点

- 配置文件里的所有路径需要是相对配置文件根目录的路径，参考默认配置

## 自定义模板、样式、主题

模板引擎为ejs，在创建阶段会提供一些变量使用，所以自定义模板只要提供符合ejs语法的文件传递给配置项即可。

参考：[https://github.com/hiNISAL/never-write/blob/main/templates/theme/plain-dark/index.html](https://github.com/hiNISAL/never-write/blob/main/templates/theme/plain-dark/index.html)

### 传递给EJS的选项

```ts
interface PostOptions {
  // markdown文件头部的yaml信息
  meta: Record<string, any>.
  // 拼接 publicPath后的路径
  staticPath: string;
  // 在站点中的相对路径
  relativePath: string;
  // markdown文件的文件信息
  sourceFileStat: fs.Stats;
  // 文件保存的名称
  filename: string;
  // 不包含后缀的文件名
  filenameWithoutExt: string;
  // never-write.yaml 中的 site 配置项
  site: { name: string; desc: string };
  // markdown 转换后的 html
  html: string;
  // md转换后剔除标签的文本内容
  text: string;
  // 摘要 默认取text的前100个字符
  summary: string;
  // 根据配置中 render.dateFormatter 生成的时间
  // mtime 是文件的修改时间
  dateFormat: { mtime: string };
  // 本地保存目录
  postSavedDir: string;
  // 保存在本地的路径
  postSavedFullPath: string;
  namespace: 'post';
  // 首页的路径
  home: string;
}
```

### 索引页面传递的内容

`template.index` 和 `template.tagIndexes` 获得的属性是一样的。

```ts
interface IndexesOptions {
  // 由 post 组成的数组，长度为配置的pageSize
  posts: PostOptions[];
  // 当前第几页
  page: number;
  // 共有几页
  pageTotal: number;
  // 共由几篇内容
  totalCount: number;
  // 当前自己的站点相对路径
  selfPath: string;
  // 上一页的站点相对路径
  prevPagePath: string;
  // 下一页的站点相对路径
  nextPagePath: string;
  // 当前自己的站点拼接publicPath后的相对路径
  selfStaticPath: string;
  // 上一页的站点拼接publicPath后的相对路径
  prevPageStaticPath: string;
  // 下一页的站点拼接publicPath后的相对路径
  nextPageStaticPath: string;
  // 是否第一页
  isFirstPage: boolean;
  // 是否最后一页
  isEndPage: boolean;
  // never-write.yaml 中的 site 配置项
  site: { name: string; desc: string };
  namespace: 'indexes'|'tag';
  // 聚合好的tag
  tag: Record<string, {
    posts: PostOptions[];
    staticPath: string;
  }>;
  // 当前页面的tag，如果namespace是indexes，则永远为空
  tag: '';
  // 首页路径
  home: string;
}
```

## hook

在配置中加入：

```yaml
build:
  hook: ./hook/index.js
```

在`build`过程中就会读取该文件，并且执行对应的钩子。

```js
// ./hook/index.js

module.exports = {
  // 生成每一篇前执行
  eachBeforeRenderPost(opt) {
    console.log(opt);
  },
  // 生成每一篇后执行
  eachAfterRenderPost(opt) {
    console.log(opt);
  },
  // 生成每一页索引前执行
  eachBeforeRenderIndexes(opt): {
    console.log(opt);
  },
  // 生成每一页索引后执行
  eachAfterRenderIndexes(opt): {
    console.log(opt);
  },
  // 生成每一页tag索引前执行
  eachBeforeRenderTagsIndexes(opt) {
    console.log(opt);
  },
  // 生成每一页tag索引后执行
  eachAfterRenderTagsIndexes(opt) {
    console.log(opt);
  },
  // 在索引页中的排序规则
  sortBy(a, b) {
    // ...
  },
};
```

## 怎么配置tag

markdown 文件的头部可以用yaml描述一些信息：

```md
---
title: page title
tag: tag1, tag2, tag3
---

## 正文内容

嘻嘻哈哈哈
```

其中`tag`会通过`,`切割后解析成数组（可以直接传递yaml语法中的数组）。

在处理所有markdown文件时，会根据tag聚合。

## 保留目录

这些目录有特殊用途，在`posts`目录下不能使用。

- page
  用于存放索引分页
- tags
  用于存放tag索引页
