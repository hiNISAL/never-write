# never-write

🇨🇳[中文](https://github.com/hiNISAL/never-write#never-wirte) | [ENGLISH](https://github.com/hiNISAL/never-write/blob/main/readme-en.md)


`never-write` is a static site generator by `markdown`.

## INSTALL

```shell
npm i never-write -g
```

## USAGE

```shell
# initialize, must in an empty dir.
neverw --init

# generate
neverw build
```

## NEVERW --INIT

`neverw --init` will generate a base template.

```shell
# all article write in this dir
- posts/
# static resource
- public/
# config file
- never-write.yaml
```

all articles(markdown file) write in `posts` dir.

can change the root by config(build.postsRootPath).

## never-write.yaml

the root has `never-write.yaml` mean its a site will handler by never-write.

```yaml
site:
  name: site name
  desc: site description

build:
  outDir: output dir
  publicPath: base URL that app will be deployed at
  postsRootPath: markdown files root
  publicResourcePath: static resources, will copy to `outDir`
  hook: hooks file dir

render:
  template:
    index: indexes page template
    post: post page template
  pageSize: indexes page post size
  dateFormatter: `never-write` will pre handler some date, then pipe to ejs to use, this options is the date formatter
  summaryLength: summary split length
```

default config:

```yaml
site:
  name:
  desc:

build:
  outDir: ./dist
  publicPath: /
  postsRootPath: ./posts
  publicResourcePath: ./public
  hook:

render:
  template: plain-dark
  pageSize: 15
  dateFormatter: YYYY/MM/DD hh:mm:ss
  summaryLength: 100
```

## TIPS

- all path need be relative from root

## custom theme/style/template

the template engined by ejs, in build stage, `never-write` will given some options to template, then generate the static page.

so if need custom the theme, just use options `render.template`, given it a ejs template.

sample：[https://github.com/hiNISAL/never-write/blob/main/templates/theme/plain-dark/index.html](https://github.com/hiNISAL/never-write/blob/main/templates/theme/plain-dark/index.html)

### EJS OPTIONS

for post page:

```ts
interface PostOptions {
  // markdown file header yaml config
  meta: Record<string, any>.
  // the path jointed public path
  staticPath: string;
  // the relative path in site
  relativePath: string;
  // markdown file stats
  sourceFileStat: fs.Stats;
  // saved file name
  filename: string;
  // saved file name without ext
  filenameWithoutExt: string;
  // the site option in never-write.yaml
  site: { name: string; desc: string };
  // parsed markdown
  html: string;
  // markdown content without tag
  text: string;
  // post summary, the length decide from config(render.summaryLength)
  summary: string;
  // the date format from render.dateFormatter
  // mtime is the markdown file modify time
  dateFormat: { mtime: string };
  // local saved dir
  postSavedDir: string;
  // local saved full path
  postSavedFullPath: string;
}
```

for indexes page:

```ts
interface IndexesOptions {
  // posts array, length decide from render.pageSize
  posts: PostOptions[];
  // current page
  page: number;
  // total page length
  pageTotal: number;
  // total post length
  totalCount: number;
  // self relative path from site
  selfPath: string;
  // prev page resolve path from site
  prevPagePath: string;
  // next page resolve path from site
  nextPagePath: string;
  // self relative path from site jointed `build.publicPath`
  selfStaticPath: string;
  // prev page relative path from site jointed `build.publicPath`
  prevPageStaticPath: string;
  // next page relative path from site jointed `build.publicPath`
  nextPageStaticPath: string;
  // self is the first page
  isFirstPage: boolean;
  // self is the last Page
  isEndPage: boolean;
  // the site option in `never-write.yaml`
  site: { name: string; desc: string };
}
```

## hook

added to never-write.yaml：

```yaml
build:
  hook: ./hook/index.js
```

at build stage will read this path to get hook file, in time will exec the hook.

```js
// ./hook/index.js

module.exports = {
  // before generate each post exec
  eachBeforeRenderPost(opt) {
    console.log(opt);
  },
  // after generate each post exec
  eachAfterRenderPost(opt) {
    console.log(opt);
  },
  // before generate each indexes file exec
  eachBeforeRenderIndexes(opt): {
    console.log(opt);
  },
  // after generate each indexes file exec
  eachAfterRenderIndexes(opt): {
    console.log(opt);
  },
  // indexed page's posts sort function
  // default is DESC
  sortBy(a, b) {
    // ...
  },
};
```
