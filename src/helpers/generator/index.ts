import path from 'path';
import { parseMarkdown } from '../parse-markdown';
import { getEachFilePath } from '../utils/each-file';
import { chunk, trim, assign, isString } from 'lodash';
import dayjs from 'dayjs';
import fs from 'fs-extra';
import ejs, { render } from 'ejs';
import cheerio from 'cheerio';
import { DEFAULT_EJS_TEMPLATE, NeverWriteConfig } from '../get-config/config';

// -------------------------------------------------------------------------
const presetTemplates: Record<string, {
  index: string;
  post: string;
  tagIndexes: string;
}> = {
  plain: {
    index: '../../../templates/theme/plain/index.html',
    tagIndexes: '../../../templates/theme/plain/index.html',
    post: '../../../templates/theme/plain/post.html',
  },
  'plain-dark': {
    index: '../../../templates/theme/plain-dark/index.html',
    post: '../../../templates/theme/plain-dark/post.html',
    tagIndexes: '../../../templates/theme/plain-dark/index.html',
  },
};

// -------------------------------------------------------------------------
// output interface
interface Out {
  relativePath: string;
  sourceFileStat: fs.Stats;
  filename: string;
  filenameWithoutExt: string;
  site: Record<string, any>;
  meta: Record<string, any>;
  html: string;
  dateFormat: {
    mtime: string;
  };
  text: string;
  summary: string;
  postSavedDir: string;
  postSavedFullPath: string;
  staticPath: string;
  namespace: string;
  home: string;
}

// -------------------------------------------------------------------------
// generate posts
export const generator = async (root: string, config: NeverWriteConfig) => {
  const { build, site, render: renderConfig } = config;
  const { outDir } = build;
  const { pageSize } = renderConfig;

  const distDir = path.resolve(root, outDir);
  const postsRoot = path.resolve(root, build.postsRootPath);

  const home = `${build.publicPath}index.html`;

  const postTemplate = (() => {
    let filePath = '';

    if (isString(renderConfig.template)) {
      filePath = path.resolve(__dirname, `${presetTemplates[renderConfig.template].post}`)
    } else  if (renderConfig.template.post) {
      filePath = path.join(root, renderConfig.template.post);
    } else {
      filePath = path.resolve(__dirname, `${presetTemplates[DEFAULT_EJS_TEMPLATE].post}`)
    }

    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.log(`[INFO] ❌ missing template: ${filePath}`);
      throw err;
    }
  })();

  const indexedTemplate = (() => {
    let filePath = '';

    if (isString(renderConfig.template)) {
      filePath = path.resolve(__dirname, `${presetTemplates[renderConfig.template].index}`)
    } else if (renderConfig.template.index) {
      filePath = path.join(root, renderConfig.template.index);
    } else {
      filePath = path.resolve(__dirname, `${presetTemplates[DEFAULT_EJS_TEMPLATE].index}`)
    }

    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.log(`[INFO] ❌ missing template: ${filePath}`);
      throw err;
    }
  })();

  const tagIndexesTemplate = (() => {
    let filePath = '';

    if (isString(renderConfig.template)) {
      filePath = path.resolve(__dirname, `${presetTemplates[renderConfig.template].tagIndexes}`)
    } else if (renderConfig.template.index) {
      filePath = path.join(root, renderConfig.template.tagIndexes);
    } else {
      filePath = path.resolve(__dirname, `${presetTemplates[DEFAULT_EJS_TEMPLATE].tagIndexes}`)
    }

    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.log(`[INFO] ❌ missing template: ${filePath}`);
      throw err;
    }
  })();

  const hook = (() => {
    if (build.hook) {
      try {
        return require(path.join(root,build.hook));
      } catch (err) {
        console.log(`[INFO] ❌ missing hook file: ${build.hook}`);
        throw err;
      }
    }

    return {};
  })();

  // let outs: Out[] = [];

  // -------------------------------------------------------------------------
  // got each post meta
  const sourceMarkdownFiles = getEachFilePath(postsRoot)
    .filter(({ dir }) => {
      return dir.endsWith('.md');
    });

  let outs: Out[] = sourceMarkdownFiles
    // -------------------------------------------------------------------------
    // make each post configuration
    // if some day its slow, can use multi thread
    .map(({ dir }: { dir: string }) => {
      const sourceStat = fs.statSync(dir);
      const str = fs.readFileSync(dir, 'utf-8');

      const {
        content: md,
        meta,
      } = parseMarkdown(str);

      const relativePath = path.relative(postsRoot, dir);
      const dirChunk = relativePath.split('/');

      const [filename] = dirChunk.pop()?.split('.')!;

      const relativeDir = dirChunk.join('/');
      const postSavedDir = path.resolve(distDir, relativeDir);

      const savedFilename = `${filename}.html`;

      const $ = cheerio.load(md);

      const textContent = trim($.text());

      const postRelativePathInSite = path.join(relativeDir, savedFilename);

      const out: Out = {
        meta,
        relativePath: postRelativePathInSite,
        sourceFileStat: sourceStat,
        filename: savedFilename,
        filenameWithoutExt: filename,
        site: config.site as any,
        html: md,
        dateFormat: {
          mtime: dayjs(sourceStat.mtime).format(renderConfig.dateFormatter),
        },
        text: textContent,
        summary: textContent.length > renderConfig.summaryLength
          ? (`${textContent.substring(0, renderConfig.summaryLength)}...`)
          : textContent,
        postSavedDir,
        postSavedFullPath: path.resolve(postSavedDir, savedFilename),
        staticPath: `${build.publicPath}${postRelativePathInSite}`,
        namespace: 'post',
        home,
      };

      return out;
    });

  // -------------------------------------------------------------------------
  // default is sort by modify time
  outs = hook.sortBy
    ? outs.sort(hook.sortBy)
    : outs.sort((a: Out, b: Out) => {
        const mTimeA = a.sourceFileStat.mtime.getTime();
        const mTimeB = b.sourceFileStat.mtime.getTime();

        return mTimeB - mTimeA;
      });

  // -------------------------------------------------------------------------
  // generate each post

  // tags
  interface Tag {
    [propType: string]: {
      posts: Out[];
      staticPath: string;
    };
  };
  const tags: Tag = {};

  for (let idx = 0, len = outs.length; idx < len; idx++) {
    const post = outs[idx];

    const html = ejs.render(postTemplate, assign(post, {
      prevPost: outs[idx - 1],
      nextPost: outs[idx + 1],
    }));

    if (hook.eachBeforeRenderPost) {
      await hook.eachBeforeRenderPost(post);
    }

    console.log(`[info] saving ${post.relativePath}`);

    // make sure has dir
    await fs.mkdirp(post.postSavedDir);
    fs.writeFile(post.postSavedFullPath, html);

    if (hook.eachAfterRenderPost) {
      await hook.eachAfterRenderPost(post);
    }

    // got tag info
    let tag = post.meta.tag || [];

    tag.forEach((tagName: string) => {
      if (!tags[tagName]) {
        tags[tagName] = {
          posts: [],
          staticPath: `${build.publicPath}tags/${tagName}/1.html`,
        };
      }

      tags[tagName].posts.push(post);
    });
  }

  // -------------------------------------------------------------------------
  // generate tags
  {
    const allTagStoreRoot = path.join(distDir, '/tags/');

    for (let i of Object.entries(tags)) {
      const [tagName, tagInfo] = i;

      const { posts } = tagInfo;

      const storeRoot = path.join(allTagStoreRoot, tagName);

      const chunks = chunk(posts, pageSize);

      const totalCount = posts.length;

      for (let pageIndex = 0, len = chunks.length; pageIndex < len; pageIndex++) {
        const chunk = chunks[pageIndex];
        const page = pageIndex + 1;

        const options = {
          posts: chunk,
          page,
          pageTotal: len,
          totalCount,
          selfPath: `/tags/${tagName}/${page}.html`,
          prevPagePath: page === 1 ? '' : `/tags/${tagName}/${page - 1}.html`,
          nextPagePath: page === len ? '' : `/tags/${tagName}/${page + 1}.html`,
          selfStaticPath: `${build.publicPath}tags/${tagName}/${page}.html`,
          prevPageStaticPath: page === 1
            ? ''
            : `${build.publicPath}tags/${tagName}/${page - 1}.html`,
          nextPageStaticPath: page === len
            ? ''
            : `${build.publicPath}tags/${tagName}/${page + 1}.html`,
          isFirstPage: page === 1,
          isEndPage: page === len,
          site: config.site,
          namespace: 'tag',
          tag: tagName,
          tags,
          home,
        };

        const postListHtml = ejs.render(tagIndexesTemplate, options);

        const filename = `${page}.html`;
        const pathPrefix = path.join('/tags/', tagName);

        const hookOptions = {
          ...options,
          html: postListHtml,
          storeRoot,
          filename,
          pathPrefix,
        };

        await fs.mkdirp(storeRoot);

        if (hook.eachBeforeRenderTagsIndexes) {
          hook.eachBeforeRenderTagsIndexes(hookOptions);
        }

        console.log(`[info] saving ${path.join(pathPrefix, filename)}`);
        fs.writeFileSync(path.join(storeRoot, filename), postListHtml);

        if (hook.eachAfterRenderTagsIndexes) {
          hook.eachAfterRenderTagsIndexes(hookOptions);
        }
      }
    }
  }

  // -------------------------------------------------------------------------
  // generate indexes
  {
    const chunks = chunk(outs, pageSize);

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
        namespace: 'indexes',
        tags,
        tag: '',
        home,
      };

      const postListHtml = ejs.render(indexedTemplate, options);

      let filename = 'index.html';
      let pathPrefix = '/';
      if (pageIndex !== 0) {
        filename = `${page}.html`;
        pathPrefix = '/page/';
      }

      const storeRoot = path.join(distDir, pathPrefix);

      const hookOptions = {
        ...options,
        html: postListHtml,
        storeRoot,
        filename,
        pathPrefix,
      };

      if (hook.eachBeforeRenderIndexes) {
        hook.eachBeforeRenderIndexes(hookOptions);
      }

      await fs.mkdirp(storeRoot);

      console.log(`[info] saving ${path.join(pathPrefix, filename)}`);
      fs.writeFileSync(path.join(storeRoot, filename), postListHtml);

      if (hook.eachAfterRenderIndexes) {
        hook.eachAfterRenderIndexes(hookOptions);
      }
    }
  }

  // -------------------------------------------------------------------------
  // copy public resource to dist root
  if (build.publicResourcePath) {
    try {
      const publicResourcePath = path.resolve(root, build.publicResourcePath);

      fs.statSync(publicResourcePath);

      fs.copySync(publicResourcePath, path.resolve(distDir, build.publicResourcePath));
    } catch (err) {
      throw err;
    }
  } else {
    // -------------------------------------------------------------------------
    // default copy `${root}/public` to `${dist}/public`
    const defaultPublicResourcePath = './public';

    try {
      const publicResourcePath = path.resolve(root, defaultPublicResourcePath);

      fs.copySync(publicResourcePath, path.resolve(distDir, defaultPublicResourcePath));
    } catch {}
  }
};
