import { AppEvents } from '~/type/customEvent'

export const sendEvent = <K extends keyof AppEvents>(eventName: K, detail: AppEvents[K]) => {
    document.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export const listenEvent = <K extends keyof AppEvents>(
    eventName: K,
    handler: (detail: AppEvents[K]) => void,
    context: EventTarget = document,
) => {
    const wrappedHandler = ((event: CustomEvent<AppEvents[K]>) => {
        handler(event.detail)
    }) as EventListener

    context.addEventListener(eventName, wrappedHandler)
    return () => context.removeEventListener(eventName, wrappedHandler)
}
