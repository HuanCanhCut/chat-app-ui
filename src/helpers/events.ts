export const sendEvent = ({ eventName, detail }: { eventName: string; detail?: any }) => {
    document.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export const listenEvent = ({
    eventName,
    handler,
    context = document,
}: {
    eventName: string
    handler: ({ detail }: { detail?: any }) => void
    context?: any
}) => {
    context.addEventListener(eventName, handler)
    return () => context.removeEventListener(eventName, handler)
}
