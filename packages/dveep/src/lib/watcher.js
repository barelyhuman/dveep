import chokidar from 'chokidar'

export function watch(files, options) {
  return chokidar.watch(files, {
    ...options,
  })
}
