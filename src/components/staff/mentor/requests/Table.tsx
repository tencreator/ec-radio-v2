import { headers, cookies } from "next/headers"
import { Permissions, hasPermission } from "@/utils/permissions"
import { auth } from "@/utils/auth"
import Image from "next/image"
import Table from "@/components/utils/Table"
import { Session } from "inspector/promises"

interface request {
    id: string
    name: string
    date: string
    message: string
    status: string
    ip: string
    processed_at: string
    user: {
        id: string
        name: string
        avatar: string
    }
    ban_ip?: JSX.Element
}

interface bannedIP {
    id: string
    ip: string
    banned: boolean
    bannedBy: string
    bannedAt: string
}

const thClasses = 'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'

export default async function Requests({ filter }: { filter: string }) {
    const session = await auth()
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    async function getBannedIPs() {
        try {
            const endpoint = url + '/api/requests/ban'
            const res = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': (await cookies()).toString()
                }
            })

            if (!res.ok) return

            const data = await res.json()

            loading = false

            return data.banned
        } catch (e) {
            console.error(e)
        }
    }

    async function getRequests(filter?: string) {
        try {
            const endpoint = url + '/api/requests?all=true' + (filter ? `&filter=${filter}` : '')
            const res = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': (await cookies()).toString()
                }
            })

            if (!res.ok) return

            const data = await res.json()

            if (!data.requests) return

            const requests = await Promise.all(data.requests.map(async (request: any) => {
                const canBan = await hasPermission(session?.user?.providerId as string, Permissions.BAN_IP)

                if (canBan) {
                    const bannedIPs: bannedIP[] = await getBannedIPs()
                    const banned = bannedIPs.find(ip => ip.ip === request.ip)

                    return {
                        id: request.id,
                        name: request.name,
                        date: formatDate(request.date),
                        message: request.message,
                        status: request.pending ? 'Pending' : (request.accepted ? 'Accepted' : 'Denied'),
                        ip: request.ip,
                        processed_at: request.processedAt ? formatDate(request.processedAt) : 'N/A',
                        user: {
                            id: request.processedBy,
                            name: request.user.displayName,
                            avatar: request.user.avatar
                        },
                        ban_ip: !banned ? <BanButton ip={request.ip} url={url} /> : <UnBanButton ip={request.ip} url={url} />
                    }
                }

                return {
                    id: request.id,
                    name: request.name,
                    date: request.date,
                    message: request.message,
                    status: request.pending ? 'Pending' : (request.accepted ? 'Accepted' : 'Denied'),
                    ip: request.ip,
                    processed_at: request.processedAt,
                    user: {
                        id: request.processedBy,
                        name: request.user.displayName,
                        avatar: request.user.avatar
                    },
                    ban_ip: null
                }
            }))

            loading = false

            return requests
        } catch (e) {
            console.error(e)
        }
    }

    let loading = true
    const requests: request[] = await getRequests(filter) || []

    if (await hasPermission(session?.user?.providerId as string, Permissions.BAN_IP)) {
        return (
            <Table headings={["Name", "Date", "Message", "Status", "IP", "User", "Processed At", "Ban IP"]} data={requests} />
        )
    }

    return (
        <Table headings={["Name", "Date", "Message", "Status", "IP", "User", "Processed At"]} data={requests} />
    )
}

async function BanButton({ ip, url }: { ip: string, url: string }) {
    async function banIP() {
        "use server"
        try {
            const endpoint = url + '/api/requests/ban?ip=' + encodeURIComponent(ip)
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': (await cookies()).toString()
                }
            })

            if (!res.ok) return

            const data = await res.json()

            return data.banned
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <button className='btn btn-sm btn-error' onClick={banIP}>Ban</button>
    )
}

async function UnBanButton({ ip, url }: { ip: string, url: string }) {
    async function unBanIP() {
        "use server"
        try {
            const endpoint = url + '/api/requests/ban?ip=' + encodeURIComponent(ip)
            const res = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': (await cookies()).toString()
                }
            })

            if (!res.ok) return

            const data = await res.json()

            return data.banned
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <button className='btn btn-sm btn-error' onClick={unBanIP}>Unban</button>
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