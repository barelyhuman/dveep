import klr from 'kleur'
import fs from 'node:fs/promises'
import { createServer } from 'node:http'
import path from 'node:path'
import * as polkaImports from 'polka'
import { h } from 'preact'
import preactRender from 'preact-render-to-string'
import serveStatic from 'serve-static'
import { logger } from '../lib/logger'

const normaliseImport = mod => mod.default || mod

const polka = normaliseImport(polkaImports)

// replaced during build
__config

const prepareServer = async () => {
  const app = polka()

  app.use('/public', publicDirSetup(path.resolve(__config.compiled.public)))
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
          path.resolve(__config.baseHTML),
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

const serve = app => {
  let listening = false

  app.listen(__config.port, () => {
    logger.log(`${klr.dim('>')} Listening on: ${klr.green(__config.port)}\n`)
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

async function main() {
  const { app, router } = await prepareServer()

  __applyRoutesHere

  serve(app)
}

main()
