import path from 'path';

export const getRelativePathFromWorkDir = (p: string) => {
  return path.resolve(process.cwd(), p);
};
