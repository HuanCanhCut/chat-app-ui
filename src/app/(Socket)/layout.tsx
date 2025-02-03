import Socket from '~/components/Socket/Socket'
import Sound from '~/components/Socket/Sound'

const SocketLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <Socket>
            <Sound>{children}</Sound>
        </Socket>
    )
}

export default SocketLayout
