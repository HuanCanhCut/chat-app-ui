import { memo, useState } from 'react'
import { useRouter } from 'next/navigation'

import Button from '../Button/Button'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface AccordionItem {
    title: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    description?: string
    type: string
    href?: string
    children?: AccordionItem[]
    className?: string
}

interface AccordionProps {
    data: AccordionItem
    onChose: (type: string) => void
}

const Accordion = ({ data, onChose }: AccordionProps) => {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)

    const handleToggleAccordion = () => {
        if (data.children) {
            setIsOpen(!isOpen)
        }
    }

    const handleRedirect = (href: string | undefined) => {
        if (href) {
            router.push(href)
        }
    }

    return (
        <div className={`mt-1`}>
            <Button
                buttonType="rounded"
                className={`w-full ${data.children ? '!justify-between' : '!justify-start'} rounded-md bg-transparent !py-2 text-left dark:bg-transparent ${data.className}`}
                rightIcon={
                    data.children ? (
                        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} width={12} height={12} />
                    ) : (
                        data.rightIcon || null
                    )
                }
                leftIcon={data.leftIcon}
                onClick={() => {
                    if (data.children) {
                        handleToggleAccordion()
                    } else {
                        onChose?.(data.type)
                    }
                }}
            >
                <div>
                    <p className="w-fit font-semibold" id="accordion-title" onClick={() => handleRedirect(data.href)}>
                        {data.title}
                    </p>
                    {data.description && <p className="text-xs text-gray-500 dark:text-zinc-400">{data.description}</p>}
                </div>
            </Button>

            {data.children &&
                isOpen &&
                data.children.map((data, i) => <Accordion key={i} data={data} onChose={onChose} />)}
        </div>
    )
}

export default memo(Accordion)
