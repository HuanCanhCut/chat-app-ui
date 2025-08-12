interface OpenWindowCallProps {
    memberNickname?: string
    type: 'video' | 'voice'
    conversationUuid: string
    subType: 'caller' | 'callee'
}

const openWindowCall = ({ memberNickname, type, conversationUuid, subType }: OpenWindowCallProps) => {
    window.open(
        `/call?member_nickname=${memberNickname}&initialize_video=${type === 'video' ? 'true' : 'false'}&sub_type=${subType}&uuid=${conversationUuid}`,
        `${type === 'video' ? 'Video' : 'Voice'} Call`,
        `
        width=${window.screen.width},
        height=${window.screen.height}
        `,
    )
}

export default openWindowCall
