import path from 'path';
import fs from 'fs-extra';

export const init = (root: string) => {
  const dir = fs.readdirSync(root);

  if (!dir.length) {
    fs.copySync(path.resolve(__dirname, '../../../templates/neverw-hello-template'), root);

    console.log('[INFO] 🎉 done.');
    console.log('[INFO] now can run command `neverw build` to generate posts.');
  } else {
    console.log('[INFO] ❌ directory must be empty.');
  }
};
