'use client'

import { Images } from 'lucide-react'

import PopperWrapper from '~/components/PopperWrapper'
import { Button } from '~/components/ui/button'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog'
import UserAvatar from '~/components/UserAvatar'
import { useAppSelector } from '~/redux'
import { getCurrentUser } from '~/redux/selector'

const UploadPost = () => {
    const currentUser = useAppSelector(getCurrentUser)

    return (
        <PopperWrapper className="flex items-center gap-4 rounded-xl border-none p-3 shadow-xs dark:bg-[#27292a]">
            <UserAvatar src={currentUser?.data.avatar} />

            <Dialog>
                <form className="flex-1">
                    <DialogTrigger asChild>
                        <div className="flex-1 rounded-lg bg-[#f3f2f5] p-2 text-zinc-600 select-none dark:bg-[#333334] dark:text-zinc-400">
                            {currentUser?.data.last_name} ơi, bạn đang nghĩ gì thế?
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save when you&apos;re done.
                            </DialogDescription>
                        </DialogHeader>
                        {/* <FieldGroup>
                            <Field>
                                <Label htmlFor="name-1">Name</Label>
                                <Input id="name-1" name="name" defaultValue="Pedro Duarte" />
                            </Field>
                            <Field>
                                <Label htmlFor="username-1">Username</Label>
                                <Input id="username-1" name="username" defaultValue="@peduarte" />
                            </Field>
                        </FieldGroup> */}
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit">Save changes</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>

            <div>
                <Button variant="ghost" size="icon-lg" className="dark:hover:bg-zinc-700">
                    <Images size={30} />
                </Button>
            </div>
        </PopperWrapper>
    )
}

export default UploadPost
