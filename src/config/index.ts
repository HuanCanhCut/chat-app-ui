import { auth, googleProvider } from './firebase'
import { apiEndpoint } from './apiEndpoint'
import { routes } from './routes'

const config = {
    routes,
    auth,
    googleProvider,
    apiEndpoint,
}

export default config
