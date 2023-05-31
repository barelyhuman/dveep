// A live server ws
// a constructor
// a folder that handles the islands
// a router replacement that can handle paths
// a controller path alias
// `_controllers` are a special folder

import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import fs, { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { dirname, resolve } from 'path'
import glob from 'tiny-glob'
import { buildClientFile, buildServerEntry } from './lib/builder.js'
import { config } from './lib/config.js'
import { nopanic } from './lib/promise.js'
// import { prepareServer, serve } from './lib/server.js'

export async function dveep(options) {
  config.source = options.source
  config.root = dirname(options.source)
  config.port = options.port || process.env.PORT || 3000
  config.compiled.root = resolve(config.root, '.dveep')
  config.compiled.source = resolve(config.compiled.root, 'source')
  config.generated.islands = resolve(config.compiled.root, '.generated')
  config.compiled.public = resolve(config.compiled.root, 'client')
  config.baseHTML = resolve(config.source, 'index.html')
  config.compiled.baseHTML = resolve(config.compiled.root, 'index.html')
  config.devMode = options.devMode

  await mkdir(config.compiled.source, {
    recursive: true,
  })

  const { err } = await nopanic(() => compileSource(options.source))

  if (err) {
    throw err
  }

  // If any island was generated, compile that as well
  if (existsSync(config.generated.islands)) {
    const compiledClient = await nopanic(() =>
      compileClient(config.generated.islands, {
        dev: options.devMode,
      })
    )

    if (compiledClient.err) {
      console.error(err)
      return
    }
  }

  if (!options.buildOnly) {
    const runner = spawn(
      'node',
      [`${path.join(config.compiled.root, 'node-server.cjs')}`],
      { stdio: 'inherit' }
    )

    // runner.stdout.pipe(process.stdout)

    return {
      async close() {
        runner.kill()
      },
    }
  }

  return
}

async function copyAsset(src, dest) {
  await copyFile(src, dest)
}

async function compileSource(dir) {
  const routerFile = resolve(dir, '_router.js')
  const { err, data } = await nopanic(() => fs.stat(routerFile))

  if (err || !data.isFile) {
    // TODO: handle by using the default routing mechanism
    // TODO: generate a router file with the file tree
    console.log("File doesn't exist")
    return
  }

  copyAsset(config.baseHTML, config.compiled.baseHTML)

  await buildServerEntry(
    routerFile,
    resolve(config.compiled.source, '_router.cjs')
  )

  return
}

async function compileClient(dir) {
  const clientIslands = await glob('./**/*.client.js', {
    absolute: true,
    cwd: dir,
  })

  for (const islandFile of clientIslands) {
    await buildClientFile(islandFile, resolve(config.compiled.public))
  }
}
