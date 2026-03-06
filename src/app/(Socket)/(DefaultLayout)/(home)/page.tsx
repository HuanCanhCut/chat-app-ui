import UploadPost from './components/UploadPost'

export default function Home() {
    return (
        <>
            <div className="mt-4 grid grid-cols-12 gap-4 px-2">
                <div className="hidden md:col-span-3 md:block"></div>
                <div className="col-span-12 md:col-span-6">
                    <UploadPost />
                </div>
                <div className="col-span-3 hidden md:block">
                    <h2>hello</h2>
                </div>
            </div>
        </>
    )
}
