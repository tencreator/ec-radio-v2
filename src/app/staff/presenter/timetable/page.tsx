import { Permissions } from "@/utils/permissions"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"

import { headers, cookies } from "next/headers"

export default async function Page() {
    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Connection</h1>
                    <p className="text-sm text-gray-500">Get your connection details below!</p>
                </div>


            </Suspense>
        </div>
    )
}



Page.getLayout = (page: any) => <Layout perm={Permissions.SELF_CONNECTION}>{page}</Layout>