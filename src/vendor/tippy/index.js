import tippy, { createSingleton } from 'tippy.js'

import forwardRef from './forwardRef'
import TippyGenerator from './Tippy'
import useSingletonGenerator from './useSingleton'

// eslint-disable-next-line react-hooks/rules-of-hooks
const useSingleton = useSingletonGenerator(createSingleton)

export default forwardRef(TippyGenerator(tippy))
export { tippy, useSingleton }
