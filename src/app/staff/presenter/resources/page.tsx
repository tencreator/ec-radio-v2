import { redirect } from "next/navigation"
import { hasPermission, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"
import { Suspense } from "react"
import View from "@/components/staff/presenters/resources/View"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_STATS)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Resources</h1>
                    <p className="text-sm text-gray-500">View and download songs, jingles and more here!</p>
                </div>

                <View />
            </Suspense>
        </div>
    )
}