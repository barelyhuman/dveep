import klr from 'kleur'
import fs from 'node:fs/promises'
import { createServer } from 'node:http'
import { resolve } from 'node:path'
import * as polkaImports from 'polka'
import { h } from 'preact'
import preactRender from 'preact-render-to-string'
import serveStatic from 'serve-static'
import { config } from './config'
import { normaliseImport } from './imports'
import { logger } from './logger'
const polka = normaliseImport(polkaImports)

export const prepareServer = async () => {
  const app = polka()

  app.use('/public', publicDirSetup(config.compiled.public))
  app.use(createComponentRender())

  if (!app.server) {
    app.server = createServer()
  }

  return {
    app,
    router: app,
  }
}

function createComponentRender() {
  return (_, res, next) => {
    res.componentRender = (component, props) => {
      ;(async () => {
        const baseHTML = await fs.readFile(
          resolve(config.source, 'index.html'),
          'utf8'
        )

        const componentHTML = preactRender(h(component, { ...props }))

        const finalHTML = baseHTML.replace(
          '<!--preact-island-entry-->',
          componentHTML
        )

        res.writeHeader(200, {
          'Content-Type': 'text/html',
        })

        res.end(finalHTML)
      })()
      return
    }
    next()
  }
}

function publicDirSetup(dirPath) {
  // TODO: move `public` folder data to `compiled.public`
  return serveStatic(dirPath)
}

export const serve = app => {
  let listening = false

  app.listen(config.port, () => {
    logger.log(`${klr.dim('>')} Listening on: ${klr.green(config.port)}`)
  })

  app.server.once('listening', _ => (listening = true))

  // Variation of preact/wmr's makeClosable
  // https://github.com/preactjs/wmr/blob/3c5672ecd2f958c8eaf372d33c084dc69228ae3f/packages/wmr/src/start.js#L184
  return {
    async close() {
      if (!listening) return
      await new Promise((resolve, reject) => {
        app.server.close(err => (err ? reject(err) : resolve()))
      })
    },
  }
}
