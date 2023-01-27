import { getConfig } from '../../helpers/get-config';
import { generator } from '../../helpers/generator';

export const build = async (root: string) => {
  const baseConfig = getConfig(root);

  await generator(root, baseConfig);

  const overedAt = Date.now();

  console.log(`\n[info] 🎉 done. used ${overedAt - (globalThis as any).__app_started_at}ms.`);
};
