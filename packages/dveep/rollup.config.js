import shebang from 'rollup-plugin-preserve-shebang'
// import { createRequire } from 'node:module';
import json from '@rollup/plugin-json'
import builtins from 'builtin-modules'
import nodeResolve from '@rollup/plugin-node-resolve'
import commonJs from '@rollup/plugin-commonjs'
import path from 'node:path'

// if needed
// const require = createRequire(import.meta.url);

/**@returns {import("rollup").RollupConfig} */
const config = (input, output, extras = cfg => cfg) => {
  return extras({
    input,
    output: {
      inlineDynamicImports: true,
      format: 'cjs',
      file: output,
    },
    external: [
      ...builtins,
      'fsevents',
      'preact',
      'preact/*',
      'esbuild',
      '@barelyhuman/preact-island-plugins/rollup',
    ],
    plugins: [
      shebang(),
      commonJs({
        exclude: [/\.mjs$/, /\/rollup\//, path.resolve('src')],
        ignore: builtins,
        transformMixedEsModules: true,
        requireReturnsDefault: 'preferred',
      }),
      nodeResolve({
        preferBuiltins: true,
        exportConditions: ['node', 'import', 'module', 'default'],
        extensions: ['.mjs', '.js', '.json', '.es6', '.node'],
      }),
      json(),
    ],
  })
}

export default [
  config('./src/cli.js', './dist/dveep.cjs'),
  config('./src/index.js', './dist/index.cjs'),
  config('./src/index.js', './dist/index.js', cfg => {
    cfg.output.format = 'esm'
    return cfg
  }),
]
