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
                <div>
                    <h1 className="text-3xl font-semibold">Home</h1>
                    <p className="text-sm text-gray-500">Welcome {session?.user.displayName || 'Unkown User'} to the staff page, here you can view the statistics of the radio and info about the currently playing song and what AutoDJ has planned next!</p>
                </div>

                <Stats />
            </Suspense>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_STATS}>{page}</Layout>