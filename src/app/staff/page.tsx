import { hasPermission, Permissions } from "@/utils/permissions"
import Stats from "@/components/staff/stats/stats"
import { Suspense } from "react"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation";
import Image from 'next/image'

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_STATS)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Timetable</h1>
                    <p className="text-sm text-gray-500">Welcome to the staff page, to the staff page, here you can view the statistics of the radio and info about the currently playing song and what AutoDJ has planned next!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
                <Stats />
            </Suspense>
        </div>
    )
}