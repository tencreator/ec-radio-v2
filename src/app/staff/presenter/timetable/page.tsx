import { redirect } from "next/navigation"
import { hasPermission, Permissions } from "@/utils/permissions"
import { Suspense } from "react"
import Layout from "@/app/staff/layout"
import Timetable from "@/components/staff/presenters/timetable/Timetable"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/utils/auth"


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
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Timetable</h1>
                    <p className="text-sm text-gray-500">Get to booking your preferred timeslots below!</p>
                </div>

                <div className="mt-4 flex flex-col gap-4">
                    {dates().map((date: string, index: number) => (
                        <Timetable key={index} me={session?.user.providerId as string} date={date} />
                    ))}
                </div>
            </Suspense>
        </div>
    )
}