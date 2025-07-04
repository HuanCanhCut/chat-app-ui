interface IconProps {
    width?: number
    height?: number
    className?: string
}

export const HomeIcon = ({ width = 32, height = 32, className }: IconProps) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.0484 7.84003C23.6014 7.38666 24.3975 7.38666 24.9504 7.84001L41.051 21.04C41.5411 21.4418 41.7258 22.1082 41.5125 22.705C41.2991 23.3017 40.7338 23.7 40.1 23.7H37.769L36.5769 36.7278C36.4592 38.0149 35.3798 39 34.0873 39H13.9127C12.6202 39 11.5409 38.0149 11.4231 36.7278L10.231 23.7H7.89943C7.2657 23.7 6.70035 23.3017 6.487 22.705C6.27364 22.1083 6.45833 21.4418 6.9484 21.04L23.0484 7.84003ZM23.9995 10.9397L12.0948 20.7H12.969L14.369 36H22.4994V28.3138C22.4994 27.7616 22.9471 27.3138 23.4994 27.3138H24.4994C25.0517 27.3138 25.4994 27.7616 25.4994 28.3138V36H33.631L35.031 20.7H35.9045L23.9995 10.9397Z"
            ></path>
        </svg>
    )
}

export const UserGroupIcon = ({ width = 32, height = 32, className }: IconProps) => {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 48 48"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M18 12.5C15.5897 12.5 13.5849 14.5018 13.5849 17.0345C13.5849 19.5672 15.5897 21.569 18 21.569C20.4103 21.569 22.4151 19.5672 22.4151 17.0345C22.4151 14.5018 20.4103 12.5 18 12.5ZM10.5849 17.0345C10.5849 12.9017 13.8766 9.5 18 9.5C22.1234 9.5 25.4151 12.9017 25.4151 17.0345C25.4151 21.1673 22.1234 24.569 18 24.569C13.8766 24.569 10.5849 21.1673 10.5849 17.0345ZM18 29.8793C14.0801 29.8793 10.7403 32.5616 9.69697 36.2673C9.5473 36.7989 9.03833 37.1708 8.49337 37.0811L7.50662 36.9189C6.96166 36.8292 6.58837 36.3131 6.72325 35.7776C8.00732 30.6788 12.5509 26.8793 18 26.8793C23.449 26.8793 27.9927 30.6788 29.2767 35.7776C29.4116 36.3131 29.0383 36.8292 28.4934 36.9189L27.5066 37.0811C26.9617 37.1708 26.4527 36.7989 26.303 36.2673C25.2597 32.5616 21.9199 29.8793 18 29.8793Z"
            ></path>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M33 31.5371C32.2445 31.5371 31.5198 31.668 30.8447 31.9093C30.3246 32.0951 29.7189 31.9243 29.4549 31.4392L28.9769 30.5608C28.713 30.0757 28.8907 29.463 29.4009 29.2516C30.513 28.791 31.7285 28.5371 33 28.5371C37.4554 28.5371 41.1594 31.6303 42.2706 35.7812C42.4135 36.3147 42.0386 36.8308 41.4935 36.9196L40.5065 37.0804C39.9614 37.1692 39.4546 36.7956 39.2894 36.2686C38.4217 33.5 35.91 31.5371 33 31.5371Z"
            ></path>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M33 18.5C31.6193 18.5 30.5 19.6193 30.5 21C30.5 22.3807 31.6193 23.5 33 23.5C34.3807 23.5 35.5 22.3807 35.5 21C35.5 19.6193 34.3807 18.5 33 18.5ZM27.5 21C27.5 17.9624 29.9624 15.5 33 15.5C36.0376 15.5 38.5 17.9624 38.5 21C38.5 24.0376 36.0376 26.5 33 26.5C29.9624 26.5 27.5 24.0376 27.5 21Z"
            ></path>
        </svg>
    )
}

export const UserIcon = ({ width = 20, height = 20, className }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="8" r="5" />
            <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
    )
}

export const MessageIcon = ({ width = 20, height = 20, className }: IconProps) => {
    return (
        <svg viewBox="0 0 12 13" width={width} height={height} className={className} fill="currentColor">
            <g fillRule="evenodd" transform="translate(-450 -1073)">
                <path d="m459.603 1077.948-1.762 2.851a.89.89 0 0 1-1.302.245l-1.402-1.072a.354.354 0 0 0-.433.001l-1.893 1.465c-.253.196-.583-.112-.414-.386l1.763-2.851a.89.89 0 0 1 1.301-.245l1.402 1.072a.354.354 0 0 0 .434-.001l1.893-1.465c.253-.196.582.112.413.386M456 1073.5c-3.38 0-6 2.476-6 5.82 0 1.75.717 3.26 1.884 4.305.099.087.158.21.162.342l.032 1.067a.48.48 0 0 0 .674.425l1.191-.526a.473.473 0 0 1 .32-.024c.548.151 1.13.231 1.737.231 3.38 0 6-2.476 6-5.82 0-3.344-2.62-5.82-6-5.82"></path>
            </g>
        </svg>
    )
}

export const SendIcon = ({ width = 20, height = 20, className }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
            <path d="m21.854 2.147-10.94 10.939" />
        </svg>
    )
}

export const BellIcon = ({ width = 20, height = 20, className }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            height={height}
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
    )
}

export const SendHorizontalIcon = ({ width = 20, height = 20, className }: IconProps) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={width}
            className={className}
            height={height}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3.714 3.048a.498.498 0 0 0-.683.627l2.843 7.627a2 2 0 0 1 0 1.396l-2.842 7.627a.498.498 0 0 0 .682.627l18-8.5a.5.5 0 0 0 0-.904z" />
            <path d="M6 12h16" />
        </svg>
    )
}

export const FontIcon = ({ width = 20, height = 20, className }: IconProps) => {
    return (
        <svg viewBox="0 0 12 13" width={width} height={height} fill="currentColor" className={className}>
            <g fillRule="evenodd" transform="translate(-450 -1073)">
                <g fillRule="nonzero">
                    <path
                        d="M102.54 923.197a.5.5 0 0 0 .92-.394l-3-7a.5.5 0 0 0-.92 0l-3 7a.5.5 0 0 0 .92.394l2.54-5.928 2.54 5.928z"
                        transform="translate(353.5 160)"
                    ></path>
                    <path
                        d="M98 921.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0 0 1zm7.022-2.554.05-.037c.047-.04.16-.114.327-.193.289-.135.616-.216.976-.216.655 0 1.125.494 1.125 1.079v3.42a.5.5 0 0 0 1 0v-3.42c0-1.126-.905-2.08-2.125-2.08a3.28 3.28 0 0 0-1.4.311 2.558 2.558 0 0 0-.547.334.5.5 0 0 0 .594.802z"
                        transform="translate(353.5 160)"
                    ></path>
                    <path
                        d="m107.505 920.747-.005.072c0 .649-.873 1.681-1.5 1.681-.69 0-1-.226-1-.864 0-.746.524-1.136 1.25-1.136h1.365a.498.498 0 0 0-.11.247zm.995-.747a.5.5 0 0 0-.5-.5h-1.75c-1.224 0-2.25.763-2.25 2.136 0 1.271.815 1.864 2 1.864 1.22 0 2.5-1.514 2.5-2.682a.499.499 0 0 0-.167-.372l-.046-.037a.5.5 0 0 0 .213-.409z"
                        transform="translate(353.5 160)"
                    ></path>
                </g>
            </g>
        </svg>
    )
}

export const GalleryImageIcon = ({ width = 20, height = 20, className }: IconProps) => {
    return (
        <svg viewBox="0 0 12 13" width={width} height={height} fill="currentColor" className={className}>
            <g fillRule="evenodd" transform="translate(-450 -1073)">
                <g>
                    <path
                        d="M99.825 918.322a2.55 2.55 0 0 1 .18-.712l-.489.043a1.601 1.601 0 0 0-.892.345 1.535 1.535 0 0 0-.557 1.321l.636 7.275c.01.12.186.123.199.003l.923-8.275zm4.67 1.591a1 1 0 1 1-1.991.175 1 1 0 0 1 1.991-.175m3.099 1.9a.422.422 0 0 0-.597-.05l-1.975 1.69a.288.288 0 0 0-.032.404l.442.526a.397.397 0 0 1-.606.51l-1.323-1.576a.421.421 0 0 0-.58-.063l-1.856 1.41-.265 2.246c-.031.357.173 1.16.53 1.19l6.345.397c.171.014.395-.02.529-.132.132-.111.38-.49.396-.661l.405-4.239-1.413-1.652z"
                        transform="translate(352 156.5)"
                    ></path>
                    <path
                        fillRule="nonzero"
                        d="m107.589 928.97-6.092-.532a1.56 1.56 0 0 1-1.415-1.687l.728-8.328a1.56 1.56 0 0 1 1.687-1.416l6.091.533a1.56 1.56 0 0 1 1.416 1.687l-.728 8.328a1.56 1.56 0 0 1-1.687 1.415zm.087-.996.06.002a.561.561 0 0 0 .544-.508l.728-8.328a.56.56 0 0 0-.507-.604l-6.09-.533a.56.56 0 0 0-.605.507l-.728 8.328a.56.56 0 0 0 .506.604l6.092.532z"
                        transform="translate(352 156.5)"
                    ></path>
                </g>
            </g>
        </svg>
    )
}

export const StarShieldIcon = ({ width = 20, height = 20, className }: IconProps) => {
    return (
        <svg
            viewBox="0 0 20 20"
            width={width}
            height={height}
            fill="currentColor"
            aria-hidden="true"
            className={className}
        >
            <g fillRule="evenodd" transform="translate(-446 -398)">
                <g>
                    <path
                        fillRule="nonzero"
                        d="M104.44 214.374c4.402-1.205 6.815-4.15 7.732-7.837.22-.884.328-1.814.328-2.774v-4.204a1.55 1.55 0 0 0-1.24-1.53c-2.622-.513-5.164-1.508-6.674-3.067a1.509 1.509 0 0 0-2.172 0c-1.51 1.559-4.053 2.554-6.674 3.068a1.55 1.55 0 0 0-1.24 1.529v4.204c0 .961.107 1.89.327 2.774.92 3.687 3.332 6.632 7.734 7.837a3.565 3.565 0 0 0 1.724.039l.154-.039zm-1.483-1.446c-3.824-1.048-5.876-3.553-6.674-6.753a9.963 9.963 0 0 1-.283-2.412v-4.204c0-.034.017-.055.03-.057 2.898-.568 5.68-1.657 7.461-3.497.007-.006.011-.006.017 0 1.782 1.84 4.563 2.929 7.463 3.497.012.002.03.023.03.057v4.204c0 .841-.094 1.65-.284 2.412-.782 3.142-2.775 5.614-6.467 6.694l-.207.059a2.064 2.064 0 0 1-1.086 0z"
                        transform="translate(352.5 203.5)"
                    ></path>
                    <path
                        d="m103.814 200.194 1.205 2.408 2.679.384c.29.042.405.404.193.608l-1.933 1.857.458 2.632a.352.352 0 0 1-.507.377l-2.409-1.249-2.41 1.249a.352.352 0 0 1-.506-.377l.458-2.632-1.933-1.857a.356.356 0 0 1 .194-.608l2.678-.384 1.206-2.408a.35.35 0 0 1 .627 0"
                        transform="translate(352.5 203.5)"
                    ></path>
                </g>
            </g>
        </svg>
    )
}
