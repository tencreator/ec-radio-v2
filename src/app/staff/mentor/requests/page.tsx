import { Permissions } from "@/utils/permissions"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"
import Table from "@/components/staff/mentor/requests/Table"


export default function Page() {
    return (
        <div className="mt-4 px-8">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Request Logs</h1>
                    <p className="text-sm text-gray-500">Check all logs below and who has processed them!</p>
                </div>

                <div className="mt-4 mx-auto flex flex-col gap-4">
                    <div>
                        <h3 className="text-xl font-medium">Song Requests</h3>
                        <Table filter="song" />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium">Shoutout Requests</h3>
                        <Table filter="shoutout" />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium">Joke Requests</h3>
                        <Table filter="joke" />
                    </div>
                </div>
            </Suspense>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.MANAGE_REQUESTS}>{page}</Layout>