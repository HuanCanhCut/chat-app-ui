import tippy, { createSingleton } from 'tippy.js/headless'

import forwardRef from '../forwardRef'
import TippyGenerator from '../Tippy'
import useSingletonGenerator from '../useSingleton'

// eslint-disable-next-line react-hooks/rules-of-hooks
const useSingleton = useSingletonGenerator(createSingleton)

export default forwardRef(TippyGenerator(tippy), { render: () => '' })
export { tippy, useSingleton }
