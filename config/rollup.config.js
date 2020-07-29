import sucrase from '@rollup/plugin-sucrase';
import resolve from '@rollup/plugin-node-resolve';

import pkg from '../package.json';

export default {
  input: 'src/index.ts',
  output: {
    // file: 'dev/lib.esm.js', // pkg.module,
    // format: 'esm',
    file: 'dev/lib.umd.js',
    format: 'umd',
    name: "Query",
  },
  plugins: [
    resolve({
      extensions: ['.js', '.ts']
    }),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript']
    })
  ]
};
