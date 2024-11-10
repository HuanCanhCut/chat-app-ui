import { faCamera, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState, useRef, useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { SubmitHandler, useForm } from 'react-hook-form'

import * as meService from '~/services/meService'
import Button from '~/components/Button'
import PopperWrapper from '~/components/PopperWrapper'
import config from '~/config'
import CustomImage from '~/components/Image'
import { UserResponse } from '~/type/type'
import Input from '~/components/Input'
import { toast } from '~/helpers/toast'
import UserAvatar from '~/components/UserAvatar'

interface IFile extends File {
    preview: string
}

interface FieldValue {
    full_name: string
    nickname: string
}

interface EditProfileProps {
    closeModal: () => void
}

const defaultCoverPhoto = '/static/media/login-form.jpg'

const EditProfile = ({ closeModal }: EditProfileProps) => {
    const { data: currentUser } = useSWR<UserResponse | undefined>(config.apiEndpoint.me.getCurrentUser, () => {
        return meService.getCurrentUser()
    })

    const { handleSubmit, control } = useForm<FieldValue>()

    const inputRef = useRef<HTMLInputElement>(null)
    const inputCoverPhotoRef = useRef<HTMLInputElement>(null)

    const [avatar, setAvatar] = useState<IFile>()
    const [coverPhoto, setCoverPhoto] = useState<IFile>()

    type FileType = 'avatar' | 'cover_photo'
    const handleChange = (e: any, type: FileType) => {
        const file = e.target.files?.[0]
        file.preview = URL.createObjectURL(file)

        if (file) {
            switch (type) {
                case 'avatar':
                    setAvatar(file)
                    break
                case 'cover_photo':
                    setCoverPhoto(file)
                    break
            }
        }
    }

    useEffect(() => {
        return () => {
            avatar?.preview && URL.revokeObjectURL(avatar.preview)
            coverPhoto?.preview && URL.revokeObjectURL(coverPhoto.preview)
        }
    }, [avatar, coverPhoto])

    const onSubmit: SubmitHandler<FieldValue> = async (data) => {
        try {
            const formData = new FormData()

            if (avatar) {
                formData.append('avatar', avatar)
            }

            if (coverPhoto) {
                formData.append('cover_photo', coverPhoto)
            }

            formData.append('full_name', data.full_name)
            formData.append('nickname', data.nickname)

            // handle split full_name to first_name and last_name
            const fullName = data.full_name.split(' ')

            let middle = 0

            if (fullName.length > 1) {
                middle = Math.ceil(fullName.length / 2)
            }

            const firstName = fullName.slice(0, middle).join(' ')
            const lastName = fullName.slice(middle).join(' ')

            formData.append('first_name', firstName)
            formData.append('last_name', lastName)

            // temp data
            const newData = {
                ...currentUser,
                data: {
                    ...currentUser?.data,
                    first_name: firstName,
                    last_name: lastName,
                    full_name: data.full_name,
                    nickname: data.nickname,
                    avatar: avatar?.preview || currentUser?.data.avatar,
                    cover_photo: coverPhoto?.preview || currentUser?.data.cover_photo,
                },
            }

            // fake update
            mutate(config.apiEndpoint.me.getCurrentUser, newData, {
                revalidate: false,
            })

            closeModal()

            const response: void | undefined = await meService.updateCurrentUser(formData)

            if (response) {
                toast('Cập nhật thành công')
                mutate(config.apiEndpoint.me.getCurrentUser)
            } else {
                toast('Cập nhật thất bại', 'error')
            }

            // replace state to update url without reloading page
            window.history.replaceState({}, '', `/user/@${newData.data.nickname}`)
        } catch (error) {
            console.log(error)
        }
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
                <h4>Ảnh đại diện</h4>
                <div className="flex-center">
                    <div className="relative mt-4">
                        {currentUser && (
                            <label htmlFor="avatar">
                                <UserAvatar
                                    src={avatar?.preview || currentUser.data.avatar}
                                    alt="avatar"
                                    size={130}
                                    className="mx-auto aspect-square w-[130px] cursor-pointer rounded-full border-2 border-gray-200 object-cover p-1 dark:border-gray-600 sm:w-[168px]"
                                />
                            </label>
                        )}
                        <label
                            htmlFor="avatar"
                            className="flex-center absolute bottom-1 right-1 h-9 w-9 cursor-pointer rounded-full border-2 border-white bg-gray-100 dark:border-[#242526] dark:bg-[#313233]"
                        >
                            <FontAwesomeIcon icon={faCamera} />
                        </label>
                        <input
                            ref={inputRef}
                            id="avatar"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                handleChange(e, 'avatar')
                            }}
                        />
                    </div>
                </div>
                <h4>Ảnh bìa</h4>
                <div>
                    <div className="relative mt-4">
                        {currentUser && (
                            <label htmlFor="cover_photo">
                                <CustomImage
                                    src={coverPhoto?.preview || currentUser.data.cover_photo}
                                    fallback={defaultCoverPhoto}
                                    className="mx-auto aspect-[12/5] w-[80%] cursor-pointer rounded-lg object-cover"
                                />
                            </label>
                        )}
                        <label
                            htmlFor="cover_photo"
                            className="flex-center absolute bottom-1 right-1 h-9 w-9 cursor-pointer rounded-full border-2 border-white bg-gray-100 dark:border-[#242526] dark:bg-[#313233]"
                        >
                            <FontAwesomeIcon icon={faCamera} />
                        </label>
                        <input
                            ref={inputCoverPhotoRef}
                            id="cover_photo"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                handleChange(e, 'cover_photo')
                            }}
                        />
                    </div>
                </div>
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
                                    defaultValue={currentUser?.data[field.type]}
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
