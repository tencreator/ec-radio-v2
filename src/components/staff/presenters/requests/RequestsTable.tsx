import { makeRequest } from "@/utils/request"
import Table from "@/components/utils/Table"
import RequestBtn from "./RequestBtn"

interface Props {
    filter: string
}

interface request {
    id: string
    name: string
    date: string
    message: string
}

export default async function RequestsTable({ filter }: Props): Promise<JSX.Element> {
    async function getRequests(): Promise<{ requests: request[] }> {
        const res = await makeRequest(`/api/requests?filter=${filter}`, {})
        const data = await res.json()

        if (!data.requests) return { requests: [] }

        const requests = data.requests.map((request: request) => ({
            ...request,
            date: formatDate(request.date),
            actions: <Buttons requestId={request.id} />
        }))

        return { requests }
    }

    const { requests } = await getRequests()

    return (
        <Table headings={['Date', 'Name', 'Message', 'Actions']} data={requests} />
    )
}

function Buttons({ requestId }: { requestId: string }) {
    return (
        <div>
            <RequestBtn action='accept' requestId={requestId}/>
            <RequestBtn action='deny' requestId={requestId} />
        </div>
    )
}

function formatDate(date: string): string {
    return new Date(date).toLocaleString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZoneName: 'short'
    })
}