import { Permissions, hasPermission} from "@/utils/permissions"
import { Suspense } from "react"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation";
import Table from "@/components/utils/Table";

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.OTHERS_TIMETABLE)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Timetable Logs</h1>
                    <p className="text-sm text-gray-500">Here you can see logs for when people have booked and unbooked times on the timetable!</p>
                </div>

                <div className="mt-4 flex flex-col gap-4 w-10/12 lg:w-11/12 overflow-x-scroll md:overflow-auto">
                    <h2>TODO: Make this a timeline filterable by action and username</h2>

                    <Table headings={["Time", "Action", "User"]} data={[
                        { time: "2021-10-10 12:00", action: "Booked", user: "testuser" },
                        { time: "2021-10-10 12:00", action: "Unbooked", user: "testuser" },
                        { time: "2021-10-10 12:00", action: "Booked", user: "testuser" }
                    ]} />
                </div>
            </Suspense>
        </div>
    )
}

