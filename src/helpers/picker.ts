import dynamic from 'next/dynamic'

const Picker = dynamic(
    () => {
        return import('emoji-picker-react')
    },
    { ssr: false },
)

export default Picker
