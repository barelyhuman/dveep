// A live server ws
// a constructor
// a folder that handles the islands
// a router replacement that can handle paths
// a controller path alias
// `_controllers` are a special folder

import fs from 'node:fs/promises'
import { dirname, resolve } from 'path'
import glob from 'tiny-glob'
import { buildClientFile, buildServerEntry } from './lib/builder.js'
import { config } from './lib/config.js'
import { nopanic } from './lib/promise.js'
import { prepareServer, serve } from './lib/server.js'

export async function dveep(options) {
  config.source = options.source
  config.root = dirname(options.source)
  config.port = options.port || process.env.PORT || 3000
  config.compiled.root = resolve(config.root, '.dveep')
  config.compiled.source = resolve(config.compiled.root, 'source')
  config.generated.islands = resolve(config.compiled.root, '.generated')
  config.compiled.public = resolve(config.compiled.root, 'client')
  config.devMode = options.devMode

  const { err } = await nopanic(() => compileSource(options.source))

  if (err) {
    console.error(err)
    return
  }

  const compiledClient = await nopanic(() =>
    compileClient(config.generated.islands, {
      dev: options.devMode,
    })
  )

  if (compiledClient.err) {
    console.error(err)
    return
  }

  const { app, router } = await prepareServer()

  const routerFile = resolve(config.compiled.source, '_router.cjs')
  if (routerFile) {
    let routerMod = await import(routerFile)
    routerMod = routerMod.default || routerMod
    routerMod(router)
  }

  return serve(app)
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
