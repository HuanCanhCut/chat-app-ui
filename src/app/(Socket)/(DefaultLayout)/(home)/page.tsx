import Conversation from './components/Conversation'
import PostList from './components/PostList'
import StoryList from './components/StoryList'
import UploadPost from './components/UploadPost'

export default function Home() {
    return (
        <>
            <div className="bg-light-gray dark:bg-dark grid min-h-[calc(100dvh-var(--header-height-mobile))] grid-cols-12 gap-4 px-2 pt-4 md:min-h-[calc(100dvh-var(--header-height))]">
                <div className="bp900:col-span-3 bp900:block hidden min-[1600px]:col-span-4!"></div>
                <div className="bp900:col-span-6 col-span-12 min-[1600px]:col-span-4!">
                    <div className="flex flex-col gap-3">
                        <UploadPost />

                        <StoryList />

                        <PostList />
                    </div>
                </div>
                <div className="bp900:block col-span-3 hidden min-[1600px]:col-span-4!">
                    <Conversation />
                </div>
            </div>
        </>
    )
}
