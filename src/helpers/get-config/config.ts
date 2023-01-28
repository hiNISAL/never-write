export const DEFAULT_EJS_TEMPLATE = 'plain-dark';

export interface NeverWriteConfig {
  site: {
    // site name
    // will join after page title
    name: string;
    // site description
    desc: string;
  };

  build: {
    // dist dir
    outDir: string;
    // public resource prefix
    publicPath: string;
    // the root where to find posts
    postsRootPath: string;
    // public resource path
    // will copy to dist path root
    publicResourcePath: string;
    // hook js file
    // - eachBeforeRenderPost
    // - eachAfterRenderPost
    // - eachBeforeRenderIndexes
    // - eachAfterRenderIndexes
    hook: string;
  };

  render: {
    // render ejs template
    template: {
      // post list page template
      index: string;
      // post page template
      post: string;
      // tag page template
      tagIndexes: string;
    }|string;

    // post count pre page
    pageSize: number;

    // system will pre handler some date by this formatter
    dateFormatter: string;

    // summary split len
    summaryLength: number;
  };
}


export const defaultConfig: NeverWriteConfig = {
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
  },

  render: {
    pageSize: 15,
    template: DEFAULT_EJS_TEMPLATE,
    dateFormatter: 'YYYY/MM/DD hh:mm:ss',
    summaryLength: 100,
  },
};
