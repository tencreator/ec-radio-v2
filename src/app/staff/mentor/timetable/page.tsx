import { Permissions } from "@/utils/permissions"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"
import Table from "@/components/staff/mentor/requests/Table"


export default function Page() {
    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Timetable Logs</h1>
                    <p className="text-sm text-gray-500">Here you can see logs for when people have booked and unbooked times on the timetable!</p>
                </div>

                <div className="mt-4 flex flex-col gap-4 w-10/12 lg:w-11/12 overflow-x-scroll md:overflow-auto">
                    <h2>TODO: Make this a timeline filterable by action and username</h2>
                </div>
            </Suspense>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.MANAGE_REQUESTS}>{page}</Layout>