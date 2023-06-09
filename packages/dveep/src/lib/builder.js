import preactIslandImports from '@barelyhuman/preact-island-plugins/rollup'
import nodeResolve from '@rollup/plugin-node-resolve'
import pluginReplace from '@rollup/plugin-replace'
import path, { resolve } from 'node:path'
import { rollup } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'
import externals from 'rollup-plugin-node-externals'
import copy from 'rollup-plugin-copy'
import { config } from './config.js'
import { normaliseImport } from './imports.js'
import { writeFile } from 'node:fs/promises'

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
  await writeFile(
    resolve(config.compiled.root, 'dveep.config.json'),
    JSON.stringify(config, null, 2),
    'utf8'
  )

  const inputOptsRouter = {
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

  /**
   * @type {import("rollup").RollupOptions}
   */
  const outOptsRouter = {
    format: 'cjs',
    inlineDynamicImports: false,
    file: outfile,
  }

  const inputOpts = {
    input: path.resolve(__dirname, 'entries/node-server.cjs'),
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
      pluginReplace({
        preventAssignment: true,
        __applyRoutesHere: 'await applyRoutes(router)',
        __config: '__config = config',
      }),
      copy({
        targets: [
          {
            src: resolve(config.source, 'public') + '/*',
            dest: config.compiled.public,
          },
        ],
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
    file: path.join(path.dirname(outfile), '../node-server.cjs'),
    banner: [
      `const applyRoutes = require('./source/_router.cjs')`,
      `const config = require('./dveep.config.json')`,
    ].join(';\n'),
  }

  // TODO: Inline the `server.js` file contents
  // then use that to create another file
  // which handles running prepare server and adding that to the final generated server.cjs that can be run with node.

  // Go through how nitro does the building part.
  const routerBuilder = await rollup(inputOptsRouter)
  routerBuilder.write({
    ...outOptsRouter,
  })

  const builder = await rollup(inputOpts)
  await builder.write({
    ...outputOpts,
  })

  await routerBuilder.close()
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
