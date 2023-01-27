import yaml from 'yaml';
import path from 'path';
import fs from 'fs';
import { assign, cloneDeep } from 'lodash';
import { defaultConfig, NeverWriteConfig } from './config';

const CONFIG_NAME = 'never-write.yaml';

export const getConfig = (root: string): NeverWriteConfig => {
  try {
    // -------------------------------------------------------------------------
    // read config file
    const file = fs.readFileSync(path.resolve(root, CONFIG_NAME), 'utf-8');

    const baseConfig = cloneDeep(defaultConfig);
    const userConfig: NeverWriteConfig = yaml.parse(file) || {};

    // -------------------------------------------------------------------------
    // merge default config
    assign(baseConfig.build, userConfig.build);
    assign(baseConfig.render, userConfig.render);
    assign(baseConfig.site, userConfig.site);

    return baseConfig;
  } catch (err) {
    // -------------------------------------------------------------------------
    // must need never-write config
    // its mean current directory is never-write workspace
    console.log('[INFO] ❌ missing `never-wite.yaml` file\n');
    console.log('[INFO] run command `neverw --init` to generate sample files\n');

    throw err;
  }
};
