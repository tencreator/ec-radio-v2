import { hasPermission, Permissions } from "@/utils/permissions"
import Stats from "@/components/staff/stats/stats"
import { Suspense } from "react"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_STATS)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Home</h1>
                    <p className="text-sm text-gray-500">Welcome {session?.user.displayName || 'Unkown User'} to the staff page, here you can view the statistics of the radio and info about the currently playing song and what AutoDJ has planned next!</p>
                </div>

                <Stats />
            </Suspense>
        </div>
    )
}