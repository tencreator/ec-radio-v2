import { Permissions } from "@/utils/permissions"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"
import View from "@/components/staff/presenters/resources/View"

export default async function Page() {
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

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_RESOURCES}>{page}</Layout>