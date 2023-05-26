import preactIslandImports from '@barelyhuman/preact-island-plugins/rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import externals from 'rollup-plugin-node-externals'
import { config } from './config.js'
import { normaliseImport } from './imports.js'

const preactIslands = normaliseImport(preactIslandImports)

/**
 * Takes in a single server entry file and
 * compiles it to the outfile, this is for generating
 * the server usable files that can be sent to the client
 * as static assets
 *
 * @param {string} input
 * @param {string} outdir
 */
export const buildServerEntry = async (entry, outfile) => {
  const inputOpts = {
    input: entry,
    plugins: [
      externals(),
      // TODO: enable `hash` when preact-island-plugin
      // fixes it for rollup
      preactIslands({
        hash: false,
        atomic: true,
        baseURL: '/public',
        cwd: config.compiled.root,
      }),
      esbuild({
        minify: config.devMode,
        jsx: 'automatic',
        jsxImportSource: 'preact',
        loaders: {
          '.js': 'jsx',
        },
        platform: 'node',
      }),
    ],
  }
  const outputOpts = {
    format: 'cjs',
    inlineDynamicImports: false,
    file: outfile,
  }

  const builder = await rollup(inputOpts)
  await builder.write(outputOpts)
  await builder.close()
}

/**
 * Takes in a single client sided file and
 * compiles it to the outdir, this is specifically for
 * cases where the generated island files need
 * rebuilding during watch or their initial compile.
 *
 * @param {string} input
 * @param {string} outdir
 */
export const buildClientFile = async (input, outdir) => {
  const inputOpt = {
    input,
    plugins: [
      nodeResolve(),
      esbuild({
        minify: config.devMode,
        jsx: 'automatic',
        jsxImportSource: 'preact',
        loaders: {
          '.js': 'jsx',
        },
        platform: 'browser',
      }),
    ],
  }

  const outputOpt = {
    format: 'esm',
    dir: outdir,
  }

  const builder = await rollup(inputOpt)
  await builder.write(outputOpt)
  await builder.close()
}
