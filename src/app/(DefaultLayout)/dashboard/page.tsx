import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Dashboard | Huấn Cánh Cụt',
    description: 'Dashboard Huấn Cánh Cụt',
}

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-[calc(100vh-var(--header-mobile-height))] sm:min-h-[calc(100vh-var(--header-height))]">
            <h2>Chat container</h2>
        </div>
    )
}

export default Dashboard
