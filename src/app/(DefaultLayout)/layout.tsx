import Header from '~/layouts/Header'

export default function DefaultLayout({ children }: { children: React.ReactNode }) {
    return (
        <div>
            <Header />
            <main className="mt-[var(--header-height)] dark:bg-dark">{children}</main>
        </div>
    )
}
