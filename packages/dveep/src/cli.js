#!/usr/bin/env node

import sade from 'sade'
import glob from 'tiny-glob'
import pkg from '../package.json'
import { dveep } from './dveep'
import { logger } from './lib/logger'
import { watch } from './lib/watcher.js'

const prog = sade('dveep')

let activeDveepInst

prog.version(pkg.version).option('--src', 'Source folder', './src')

prog
  .command('bottle')
  .alias('build')
  .action(async opts => {
    await dveep({
      devMode: false,
      source: opts.src,
      buildOnly: true,
    })
  })

prog
  .command('throw')
  .alias('serve')
  .option('--dev', 'Run in dev mode', false)
  .option('--port', 'Port to start the server on', 3000)
  .action(async opts => {
    activeDveepInst = await dveep({
      devMode: opts.dev,
      source: opts.src,
      port: opts.port,
    })

    if (opts.dev) {
      const watcher = watch(
        await glob('./**/*', {
          filesOnly: true,
          absolute: true,
          cwd: opts.src,
        })
      )

      let isClosingPrevious

      watcher.on('all', async (eventName, path) => {
        if (isClosingPrevious) return

        logger.info('Restaring Server...')

        if (activeDveepInst) {
          isClosingPrevious = true
          await activeDveepInst.close()
          activeDveepInst = undefined
          isClosingPrevious = false
        }

        activeDveepInst = await dveep({
          devMode: opts.dev,
          source: opts.src,
          port: opts.port,
        })
      })
    }
  })
  .parse(process.argv)
