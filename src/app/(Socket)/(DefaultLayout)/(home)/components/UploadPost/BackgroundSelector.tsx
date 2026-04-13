import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'

import { ScrollArea, ScrollBar } from '~/components/ui/scroll-area'

interface BackgroundSelectorProps {
    onSetBackground: (background: string) => void
}

const backgrounds = ['#C600FF', '#E2013B', '#111111', '#0D47A1', '#4B0082', '#2E2E2E']

const BackgroundSelector = ({ onSetBackground }: BackgroundSelectorProps) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div>
            {isOpen ? (
                <ScrollArea>
                    <div className="flex items-center gap-2">
                        <div
                            className="flex-center h-8 w-8 cursor-pointer rounded-md bg-zinc-300 dark:bg-zinc-800"
                            onClick={() => {
                                setIsOpen(false)
                            }}
                        >
                            <ChevronLeft />
                        </div>
                        <div
                            className="h-8 w-8 cursor-pointer rounded-md border-2 border-transparent bg-zinc-300 dark:bg-white"
                            onClick={() => {
                                onSetBackground('')
                            }}
                        ></div>
                        {backgrounds.map((background: string, index) => {
                            return (
                                <div
                                    key={index}
                                    className="h-8 w-8 cursor-pointer rounded-md"
                                    style={{ backgroundColor: background }}
                                    onClick={() => {
                                        onSetBackground(background)
                                    }}
                                ></div>
                            )
                        })}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            ) : (
                <div
                    className="cursor-pointer rounded-md border-2 border-white p-1 select-none dark:border-zinc-400"
                    onClick={() => {
                        setIsOpen(true)
                    }}
                >
                    Aa
                </div>
            )}
        </div>
    )
}

export default BackgroundSelector
