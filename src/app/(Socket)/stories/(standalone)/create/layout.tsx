import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Create story | HuanCanhCut',
    description: 'Create story',
}

const CreateStoryLayout = ({ children }: { children: React.ReactNode }) => {
    return <div>{children}</div>
}

export default CreateStoryLayout
