import Header from '~/layouts/Header/Header'
import Socket from '~/components/Socket/Socket'
import Sound from '~/components/Socket/Sound'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
        <Socket>
            <Sound>
                <div>
                    <Header />
                    <main className="mt-[var(--header-height-mobile)] min-h-[calc(100vh-var(--header-height-mobile))] dark:bg-dark sm:mt-[var(--header-height)] sm:min-h-[calc(100vh-var(--header-height))]">
                        {children}
                    </main>
                </div>
            </Sound>
        </Socket>
    )
}
