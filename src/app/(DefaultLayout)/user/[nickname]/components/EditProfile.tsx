import { faCamera, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AxiosResponse } from 'axios'
import Image from 'next/image'
import React, { useState, useRef, useEffect } from 'react'
import useSWR from 'swr'

import * as authService from '~/services/authService'
import Button from '~/components/Button'
import PopperWrapper from '~/components/PopperWrapper'
import config from '~/config'
import { UserResponse } from '~/type/type'
import { SubmitHandler, useForm } from 'react-hook-form'
import Input from '~/components/Input'

interface EditProfileProps {
    closeModal: () => void
}

interface IFile extends File {
    preview: string
}

interface FieldValue {}

const EditProfile = ({ closeModal }: EditProfileProps) => {
    const { data: currentUser } = useSWR<AxiosResponse<UserResponse>>(config.apiEndpoint.me.getCurrentUser, () => {
        return authService.getCurrentUser()
    })

    const { handleSubmit, control, setValue } = useForm<FieldValue>()

    const inputRef = useRef<HTMLInputElement>(null)
    const inputCoverPhotoRef = useRef<HTMLInputElement>(null)

    const [avatar, setAvatar] = useState<IFile>()
    const [coverPhoto, setCoverPhoto] = useState<IFile>()

    const handleChange = (e: any, type: string) => {
        const file = e.target.files?.[0]

        switch (type) {
            case 'avatar':
                if (file) {
                    file.preview = URL.createObjectURL(file)
                    setAvatar(file)
                }
                break
            case 'cover-photo':
                if (file) {
                    file.preview = URL.createObjectURL(file)
                    setCoverPhoto(file)
                }
                break
        }
    }

    useEffect(() => {
        return () => {
            avatar?.preview && URL.revokeObjectURL(avatar.preview)
            coverPhoto?.preview && URL.revokeObjectURL(coverPhoto.preview)
        }
    }, [avatar, coverPhoto])

    const IMAGE = [
        {
            ref: inputRef,
            label: 'Ảnh đại diện',
            type: 'avatar',
            alt: 'avatar',
            className:
                'mx-auto aspect-square w-[130px] cursor-pointer rounded-full object-cover sm:w-[168px] border-2 border-gray-200 p-1 dark:border-gray-600',
        },
        {
            ref: inputCoverPhotoRef,
            label: 'Ảnh bìa',
            type: 'cover-photo',
            alt: 'cover-photo',
            className: 'mx-auto aspect-[12/5] w-[80%] cursor-pointer object-cover rounded-lg',
        },
    ]

    const onSubmit: SubmitHandler<FieldValue> = (data) => {
        console.log(data)
    }

    interface Field {
        type: 'full_name' | 'nickname'
        label: string
        errorMessage: string
    }

    const FIELD: Field[] = [
        {
            type: 'full_name',
            label: 'Họ và tên',
            errorMessage: 'Họ và tên không được bỏ trống',
        },
        {
            type: 'nickname',
            label: 'Tên định danh',
            errorMessage: 'Tên định danh không được bỏ trống',
        },
    ]

    return (
        <PopperWrapper className="w-[700px] max-w-[90vw] overflow-y-auto">
            <header className="relative border-b border-gray-200 p-4 pb-4 dark:border-gray-800">
                <h2 className="text-center font-semibold">Chỉnh sửa hồ sơ</h2>
                <Button buttonType="icon" onClick={closeModal} className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FontAwesomeIcon icon={faXmark} />
                </Button>
            </header>
            <main className="p-4">
                {IMAGE.map((item, index) => {
                    return (
                        <React.Fragment key={index}>
                            <h4>{item.label}</h4>
                            <div className="flex-center">
                                <div className="relative mt-4">
                                    {currentUser && (
                                        <label htmlFor={item.type}>
                                            <Image
                                                src={
                                                    item.type === 'avatar'
                                                        ? avatar?.preview || currentUser.data.data.avatar
                                                        : coverPhoto?.preview || currentUser.data.data.cover_photo
                                                }
                                                alt={item.alt}
                                                width="0"
                                                height="0"
                                                sizes="100vw"
                                                priority
                                                quality={100}
                                                className={item.className}
                                            />
                                        </label>
                                    )}
                                    <label
                                        htmlFor={item.type}
                                        className="flex-center absolute bottom-1 right-1 h-9 w-9 cursor-pointer rounded-full border-2 border-white bg-gray-100 dark:border-[#242526] dark:bg-[#313233]"
                                    >
                                        <FontAwesomeIcon icon={faCamera} />
                                    </label>
                                    <input
                                        ref={item.ref}
                                        id={item.type}
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => {
                                            handleChange(e, item.type)
                                        }}
                                    />
                                </div>
                            </div>
                        </React.Fragment>
                    )
                })}
                <form className="mt-4" onSubmit={handleSubmit(onSubmit)}>
                    <h4>Thông tin cá nhân</h4>
                    {FIELD.map((field, index) => {
                        return (
                            <React.Fragment key={index}>
                                <Input
                                    name={field.type}
                                    control={control}
                                    type="text"
                                    placeholder={field.label}
                                    defaultValue={currentUser?.data.data[field.type]}
                                    rules={{
                                        required: field.errorMessage,
                                    }}
                                    className="mt-4"
                                />
                            </React.Fragment>
                        )
                    })}

                    <Button type="submit" buttonType="primary" className="mt-4 w-full">
                        Lưu thay đổi
                    </Button>
                </form>
            </main>
        </PopperWrapper>
    )
}

export default EditProfile
