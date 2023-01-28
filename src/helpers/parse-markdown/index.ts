import { isString, trim } from 'lodash';
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

  const meta = JSON.parse(JSON.stringify((md as any).meta));

  if (isString(meta.tag)) {
    meta.tag = meta.tag.split(',').map(trim);
  }

  const returns = {
    content,
    meta,
  };

  (md as any).meta = {};

  return returns;
};
