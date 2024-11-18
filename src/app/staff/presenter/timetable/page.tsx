import { Permissions } from "@/utils/permissions"
import { Suspense } from "react"
import { headers, cookies } from "next/headers"
import Layout from "@/app/staff/layout"


export default async function Page() {
    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Timetable</h1>
                    <p className="text-sm text-gray-500">Get to booking your preferred timeslots below!</p>
                </div>


            </Suspense>
        </div>
    )
}



Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_TIMETABLE}>{page}</Layout>