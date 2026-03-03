import Header from '../Header/Header'
import IncomingCall from '~/components/IncomingCall'

const DefaultLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <IncomingCall>
                <Header />
                <main className="dark:bg-dark mt-(--header-height-mobile) min-h-[calc(100dvh-var(--header-height-mobile))] overflow-hidden sm:mt-(--header-height) sm:min-h-[calc(100dvh-var(--header-height))]">
                    {children}
                </main>
            </IncomingCall>
        </div>
    )
}

export default DefaultLayout
