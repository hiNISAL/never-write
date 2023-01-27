import fs from 'fs';
import path from 'path';

export const eachFile = async (root: string, callback: Function): Promise<any> => {
  const list = fs.readdirSync(root);

  for (let i = 0, len = list.length; i < len; i++) {
    const name = list[i];

    const dir = path.resolve(root, name);

    if (fs.statSync(dir).isDirectory()) {
      await eachFile(dir, callback);
      continue;
    }

    await callback({
      dir,
      root,
    });
  }
};

export const getEachFilePath = (root: string) => {
  const arr: {
    dir: string;
    root: string;
  }[] = [];

  const each = (root: string) => {
    const list = fs.readdirSync(root);

    list.forEach((name) => {
      const dir = path.resolve(root, name);

      if (fs.statSync(dir).isDirectory()) {
        each(dir);

        return;
      }

      arr.push({
        dir,
        root,
      });
    });
  };

  each(root);

  return arr;
};
