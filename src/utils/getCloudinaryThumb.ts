const getCloudinaryVideoThumbnail = (videoUrl: string) =>
    videoUrl.replace('/video/upload/', '/video/upload/so_auto/').replace(/\.(mp4|mov|avi|webm)$/, '.jpg')

export default getCloudinaryVideoThumbnail
