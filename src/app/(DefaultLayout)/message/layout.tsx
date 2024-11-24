import { Metadata } from 'next'
import Sidebar from './Sidebar'

export const metadata: Metadata = {
    title: 'Message | Huấn Cánh Cụt',
    description: 'Message Huấn Cánh Cụt',
}

export default function MessageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen max-h-[calc(100vh-var(--header-height-mobile))] w-full dark:bg-dark dark:text-dark sm:max-h-[calc(100vh-var(--header-height))]">
            <div className="h-full w-full flex-shrink-0 overflow-y-auto md:w-[var(--sidebar-width-tablet)] lg:w-[var(--sidebar-width)]">
                <Sidebar />
            </div>
            <div className="hidden h-full flex-grow overflow-y-auto sm:block">
                <div className="flex h-full">
                    <div className={`w-full flex-grow`}>{children}</div>
                </div>
            </div>
        </div>
    )
}
