export const sendEvent = <T>({ eventName, detail }: { eventName: string; detail?: T }) => {
    document.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export const listenEvent = <T>({
    eventName,
    handler,
    context = document,
}: {
    eventName: string
    // eslint-disable-next-line no-unused-vars
    handler: ({ detail }: CustomEvent<T>) => void
    context?: any
}) => {
    context.addEventListener(eventName, handler)
    return () => context.removeEventListener(eventName, handler)
}
