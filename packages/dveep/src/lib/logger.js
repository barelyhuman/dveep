import klr from 'kleur'

export const logger = {
  log(msg) {
    process.stdout.write(msg)
  },
  info(msg) {
    process.stdout.write(
      '\n' +
        klr.dim(`[${new Date().toLocaleTimeString()}] `) +
        klr.cyan(msg) +
        '\n'
    )
  },
}
