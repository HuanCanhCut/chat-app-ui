import IncomingCall from '~/components/IncomingCall'
import Header from '~/layouts/Header/Header'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <IncomingCall>
                <Header />
                <main className="mt-[var(--header-height-mobile)] min-h-[calc(100dvh-var(--header-height-mobile))] overflow-hidden dark:bg-dark sm:mt-[var(--header-height)] sm:min-h-[calc(100dvh-var(--header-height))]">
                    {children}
                </main>
            </IncomingCall>
        </div>
    )
}
