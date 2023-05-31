import Typer from './components/typer.js'

export default function routes(router) {
  router.get('/', (req, res) => {
    res.componentRender(Typer, {
      wordCount: 6,
    })
  })
}
