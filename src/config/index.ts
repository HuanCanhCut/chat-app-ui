import { auth, googleProvider } from './firebase'
import { routes } from './routes'

const config = {
    routes,
    auth,
    googleProvider,
}

export default config
