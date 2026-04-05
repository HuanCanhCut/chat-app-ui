import { StoryModel } from '~/type/story.type'

interface StoryActionProps {
    story: StoryModel
}

const StoryAction: React.FC<StoryActionProps> = ({ story }) => {
    return (
        <div className="flex">
            {/* <h1>hello</h1>
            <h1>hello</h1>
            <h1>hello</h1>
            <h1>hello</h1>
            <h1>hello</h1> */}
        </div>
    )
}

export default StoryAction
