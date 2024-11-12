import React, { forwardRef, MutableRefObject } from 'react'
import { Controller } from 'react-hook-form'

interface Props {
    name: string
    control: any
    rules: any
    placeholder: string
    type: string
    className?: string
    showIcon?: boolean
    Icon?: React.ReactNode
    setShowIcon?: () => void
    IconClass?: string
    defaultValue?: string
}

const IconClasses = 'absolute right-3 top-1/2 translate-y-[-50%] leading-none text-gray-700'

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
                                    className={`w-full rounded-lg border border-gray-300 bg-gray-100 p-2 outline-none dark:border-gray-700 dark:bg-darkGray`}
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
                                        className={`cursor-pointer select-none dark:text-dark ${IconClass}`}
                                        onClick={setShowIcon}
                                    >
                                        {Icon}
                                    </div>
                                )}
                            </div>
                            {error && <span className="mt-1 text-sm text-error">{error.message}</span>}
                        </>
                    )}
                />
            </div>
        )
    },
)

export default Input
