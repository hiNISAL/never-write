import MDIT from 'markdown-it';
const mdMeta = require('markdown-it-meta');

const md = new MDIT();

md.use(mdMeta);
md.use(require('markdown-it-highlightjs'), {
  register: {
    cypher: require('highlightjs-cypher')
  }
});

export const parseMarkdown = (mdString: string) => {
  const content = md.render(mdString);

  const returns = {
    content,
    meta: JSON.parse(JSON.stringify((md as any).meta)),
  };

  (md as any).meta = {};

  return returns;
};
