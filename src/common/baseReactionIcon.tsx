import { AngryIcon, CareIcon, HahaIcon, HeartIcon, LikeIcon, SadIcon, WowIcon } from '~/components/Icons'
import { BaseReactionUnified } from '~/type/reaction.type'

type IconMapping = {
    [K in BaseReactionUnified]: React.ReactNode
}

const baseReactionIcon = (size: number = 16): IconMapping => {
    return {
        '1f44d': <LikeIcon width={size} height={size} />,
        '1f970': <CareIcon width={size} height={size} />,
        '2764-fe0f': <HeartIcon width={size} height={size} />,
        '1f602': <HahaIcon width={size} height={size} />,
        '1f62e': <WowIcon width={size} height={size} />,
        '1f622': <SadIcon width={size} height={size} />,
        '1f621': <AngryIcon width={size} height={size} />,
    }
}

export default baseReactionIcon
