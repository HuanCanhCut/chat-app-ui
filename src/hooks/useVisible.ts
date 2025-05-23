import { RefObject, useEffect, useMemo, useState } from 'react'

interface Options {
    root: null
    rootMargin: string
    threshold: number
}

type TargetElementType = HTMLElement

const useElementOnScreen = (options: Options, targetRef: RefObject<TargetElementType>) => {
    const [isVisible, setIsVisible] = useState(false)

    const callbackFunction = (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries
        setIsVisible(entry.isIntersecting)
    }

    const optionsMemo = useMemo(() => {
        return options
    }, [options])

    useEffect(() => {
        const observer = new IntersectionObserver(callbackFunction, optionsMemo)
        const currentTarget = targetRef.current

        if (currentTarget) {
            observer.observe(currentTarget)
        }

        return () => {
            if (currentTarget) observer.unobserve(currentTarget)
        }
    }, [targetRef, optionsMemo])

    return isVisible
}
export default useElementOnScreen
