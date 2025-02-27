import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' with { type: "json" };

const extensions = ['.ts', '.mjs'];

export default {
  input: './src/index.ts',
  output: [
    { file: pkg.main, format: 'cjs', exports: 'named', sourcemap: true },
    { file: pkg.module, format: 'esm', exports: 'named', sourcemap: true },
  ],

  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
    'path', 'fs', 'http'
  ],

  plugins: [
    json({ preferConst: true }), // Ensure JSON imports work
    typescript({ tsconfig: './tsconfig.json' }), // Use updated TypeScript plugin
    commonjs(),
    babel({
      extensions,
      babelHelpers: 'runtime',
      include: ['src/**/*'],
    }),
    resolve({ extensions }),
  ]
};