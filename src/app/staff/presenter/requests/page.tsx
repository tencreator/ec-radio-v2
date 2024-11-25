import { redirect } from "next/navigation"
import { hasPermission, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"
import ToggleRequestsButton from "@/components/staff/presenters/requests/ToggleButton"
import Table from "@/components/staff/presenters/requests/RequestsTable"
import { headers, cookies } from "next/headers"
import { RefreshButton } from "@/components/utils/RefreshButton"

async function makeRequest(uri: string, options: RequestInit) {
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    return fetch(url + uri, {
        headers: {
            'Cookie': (await cookies()).toString()
        },
        ...options
    })
}

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_REQUESTS)) return <div>Unauthorized</div>

    const isAcceptingRequests = await makeRequest('/api/requests/status', {}).then(res => res.json())
    const songRequests = await makeRequest('/api/requests?filter=song', {}).then(res => res.json())
    const shoutoutRequests = await makeRequest('/api/requests?filter=shoutout', {}).then(res => res.json())
    const jokeRequests = await makeRequest('/api/requests?filter=joke', {}).then(res => res.json())

    return (
        <div className="mt-4 px-8">
            <div>
                <h1 className="text-3xl font-semibold">Requests</h1>
                <p className="text-sm text-gray-500">View and manage presenter requests</p>
            </div>
            <div className="mt-4 flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">Toggle requests</h2>
                <ToggleRequestsButton acceptingRequests={isAcceptingRequests.acceptingRequests} />
            </div>
            <div className="mt-4 mx-auto flex flex-col gap-4">
                <div className="flex flex-row">
                    <h2 className="text-2xl font-semibold mr-4">Requests</h2>
                    <RefreshButton />
                </div>
                <div>
                    <h3 className="text-xl font-medium">Song Requests</h3>
                    <Table requests={songRequests.requests} />
                </div>
                <div>
                    <h3 className="text-xl font-medium">Shoutout Requests</h3>
                    <Table requests={shoutoutRequests.requests} />
                </div>
                <div>
                    <h3 className="text-xl font-medium">Joke Requests</h3>
                    <Table requests={jokeRequests.requests} />
                </div>
            </div>
        </div>
    )
}