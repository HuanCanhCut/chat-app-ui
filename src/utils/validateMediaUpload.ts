const isValidFile = (file: File, ACCEPTED_TYPES: string[]) => {
    if (file.type) {
        return ACCEPTED_TYPES.some((type) => file.type.startsWith(type))
    }
    return /\.(jpg|jpeg|png|gif|webp|mp4|mov|avi|mkv)$/i.test(file.name)
}

export const validateMedia = (files: FileList, ACCEPTED_TYPES: string[]) => {
    const validFiles = Array.from(files).filter((file) => {
        return isValidFile(file, ACCEPTED_TYPES)
    })

    const invalidFiles = Array.from(files).filter((file) => !isValidFile(file, ACCEPTED_TYPES))

    return { validFiles, invalidFiles }
}
