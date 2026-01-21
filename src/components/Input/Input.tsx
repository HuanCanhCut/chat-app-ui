import React, { forwardRef, MutableRefObject } from 'react'
import { Controller } from 'react-hook-form'

interface Props {
    name: string
    control: any
    rules: any
    placeholder?: string
    type: string
    className?: string
    showIcon?: boolean
    Icon?: React.ReactNode
    setShowIcon?: () => void
    IconClass?: string
    defaultValue?: string
}

const IconClasses = 'absolute right-3 top-1/2 translate-y-[-50%] leading-none text-zinc-700'

// eslint-disable-next-line react/display-name
const Input = forwardRef<HTMLInputElement, Props>(
    (
        {
            name,
            control,
            rules,
            placeholder,
            type = 'text',
            className = '',
            showIcon = false,
            Icon,
            setShowIcon = () => {},
            IconClass = IconClasses,
            defaultValue = '',
            ...props
        },
        ref,
    ) => {
        return (
            <div className={`relative ${className}`}>
                <Controller
                    name={name}
                    control={control}
                    defaultValue={defaultValue}
                    rules={rules}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <div className="relative">
                                <input
                                    className={`dark:bg-dark-gray w-full rounded-lg border border-gray-300 bg-gray-100 p-2 outline-hidden dark:border-zinc-700`}
                                    placeholder={placeholder}
                                    {...field}
                                    type={type}
                                    ref={(e) => {
                                        field.ref(e)
                                        if (ref) {
                                            ;(ref as MutableRefObject<HTMLInputElement | null>).current = e
                                        }
                                    }}
                                />
                                {showIcon && (
                                    <div
                                        className={`dark:text-dark cursor-pointer select-none ${IconClass}`}
                                        onClick={setShowIcon}
                                    >
                                        {Icon}
                                    </div>
                                )}
                            </div>
                            {error && <span className="text-error mt-1 text-sm">{error.message}</span>}
                        </>
                    )}
                    {...props}
                />
            </div>
        )
    },
)

export default Input
