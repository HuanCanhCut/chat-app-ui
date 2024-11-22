import Header from '~/layouts/Header/Header'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header />
            <main className="mt-[var(--header-height-mobile)] h-[calc(100vh-var(--header-height-mobile))] dark:bg-dark sm:mt-[var(--header-height)] sm:h-[calc(100vh-var(--header-height))]">
                {children}
            </main>
        </div>
    )
}
