import { Permissions } from "@/utils/permissions"
import Layout from "./layout"
import Stats from "@/components/staff/stats/stats"
import { Suspense } from "react"
import { auth } from "@/utils/auth"

export default async function Page() {
    const session = await auth()

    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <Stats perms={session?.user.perms || []} />
            </Suspense>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_STATS}>{page}</Layout>