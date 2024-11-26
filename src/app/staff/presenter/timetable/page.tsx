import { redirect } from "next/navigation"
import { hasPermission, Permissions } from "@/utils/permissions"
import { Suspense } from "react"
import Timetable from "@/components/staff/presenters/timetable/Timetable"
import { auth } from "@/utils/auth"
import Image from "next/image"
import { RefreshButton } from "@/components/utils/RefreshButton"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_STATS)) return <div>Unauthorized</div>

    const dates = ()=>{
        const today = new Date()
        const days = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(today)
            date.setDate(today.getDate() + i)
            days.push(date.toISOString().split("T")[0])
        }
        return days
    }

    return (
        <div className="mx-auto mt-4 container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Timetable</h1>
                    <p className="text-sm text-gray-500">Get to booking your preferred timeslots below!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"><RefreshButton /></div>
                <div className="flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
                {dates().map((date: string, index: number) => (
                    <Timetable key={index} date={date} />
                ))}
            </div>
        </div>
    )
}