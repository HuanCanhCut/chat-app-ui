import React, { forwardRef, JSXElementConstructor, MutableRefObject } from 'react'
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
        },
        ref,
    ) => {
        return (
            <div className={`relative ${className}`}>
                <Controller
                    name={name}
                    control={control}
                    defaultValue=""
                    rules={rules}
                    render={({ field, fieldState: { error } }) => (
                        <>
                            <div className="relative">
                                <input
                                    className={`w-full rounded-lg border border-gray-500 bg-gray-100 p-2 outline-none`}
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
                                    <div className={IconClass} onClick={setShowIcon}>
                                        {Icon}
                                    </div>
                                )}
                            </div>
                            {error && <span className="mt-1 text-sm text-primary">{error.message}</span>}
                        </>
                    )}
                />
            </div>
        )
    },
)

export default Input
