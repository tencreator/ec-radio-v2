import { Permissions } from "@/utils/permissions"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"
import { cookies, headers } from "next/headers"
import ToggleRequestsButton from "@/components/staff/presenters/requests/ToggleButton"
import RequestsTable from "@/components/staff/presenters/requests/RequestsTable"

export default async function Page() {
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    async function getRequests(filter?: string) {
        const endpoint = url + '/api/requests' + (filter ? `?filter=${filter}` : '')
        const cookieHeader = (await cookies()).toString()
        const res = await fetch(endpoint, {
            headers: {
                'Cookie': cookieHeader,
                'Content-Type': 'application/json'
            }
        })
        const data = await res.json()

        return data.requests
    }

    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Requests</h1>
                    <p className="text-sm text-gray-500">View and manage presenter requests</p>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold">Toggle requests</h2>
                    <ToggleRequestsButton />
                </div>
                <div className="mt-4 flex flex-col gap-4 w-10/12 lg:w-11/12 overflow-x-scroll md:overflow-auto">
                    <h2 className="text-2xl font-semibold">Requests</h2>
                    <div>
                        <h3 className="text-xl font-medium">Song Requests</h3>
                        <RequestsTable filter="song" />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium">Shoutout Requests</h3>
                        <RequestsTable filter="shoutout" />
                    </div>
                    <div>
                        <h3 className="text-xl font-medium">Joke Requests</h3>
                        <RequestsTable filter="joke" />
                    </div>
                </div>
            </Suspense>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_REQUESTS}>{page}</Layout>