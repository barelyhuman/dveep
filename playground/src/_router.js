import { HomePage } from './components/HomePage.js'

export default function routes(router) {
  router.get('/', (req, res) => {
    res.componentRender(HomePage, {})
  })
}
