import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect } from "next/navigation"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"

import ViewDetails from "@/components/staff/presenters/connection/ViewDetails"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_STATS)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Connection</h1>
                    <p className="text-sm text-gray-500">Get your connection details below!</p>
                </div>

                <ViewDetails />
            </Suspense>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.SELF_CONNECTION}>{page}</Layout>