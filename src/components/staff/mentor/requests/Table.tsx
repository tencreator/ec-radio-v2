import { headers, cookies } from "next/headers"
import { Permissions, hasPermissionSync } from "@/utils/permissions"
import { auth } from "@/utils/auth"

interface request {
    id: string
    name: string
    date: string
    message: string
    pending: boolean
    accepted: boolean
    ip: string
    processedBy: string
    processedAt: string
}

interface bannedIP {
    id: string
    ip: string
    banned: boolean
    bannedBy: string
    bannedAt: string
}

const thClasses = 'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0'

export default async function Table({filter}: {filter: string}) {
    const session = await auth()
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

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
    
            return data.requests
        } catch (e){
            console.error(e)
        }
    }

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
    
            return data.banned
        } catch (e){
            console.error(e)
        }
    }

    const requests: request[] = await getRequests(filter)
    const bannedIPs: bannedIP[] = await getBannedIPs()

    return (
        <div className="relative max-w-full overflow-auto border-2 rounded-md border-separate border-base-300 mt-4 bg-base-200">
            <table className="w-full caption-bottom text-sm border-collapse border-base-300 table-fixed">
                <thead className='[&_tr]:border-b border-collapse border-base-300'>
                    <tr className='border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted'>
                        <th className={thClasses}>Name</th>
                        <th className={thClasses}>Date</th>
                        <th className={thClasses}>Message</th>
                        <th className={thClasses}>Status</th>
                        <th className={thClasses}>IP</th>
                        <th className={thClasses}>Processed By</th>
                        <th className={thClasses}>Processed At</th>
                        {hasPermissionSync(session, Permissions.BAN_IP) && <th className={thClasses}>Ban IP</th>}
                    </tr>
                </thead>
                <tbody className='[&_tr:last-child]:border-0 border-base-300'>
                    {requests && requests.length !== 0 ? requests.map((request: request, i: number) => (
                        <tr className='border-b transition-colors hover:bg-base-200 data-[state=selected]:bg-muted border-base-300 h-12' key={i}>
                            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{request.name}</td>
                            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{formatDate(request.date)}</td>
                            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{request.message}</td>
                            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{request.pending ? 'Pending' : (request.accepted ? 'Accepted' : 'Denied')}</td>
                            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{request.ip}</td>
                            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{request.processedBy ? request.processedBy : 'N/A'}</td>
                            <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>{request.processedAt ? formatDate(request.processedAt) : 'N/A'}</td>
                            {hasPermissionSync(session, Permissions.BAN_IP) && (
                                <td className='p-4 align-middle [&:has([role=checkbox])]:pr-0'>
                                    {bannedIPs.find(ip => ip.ip === request.ip) ? <UnBanButton ip={request.ip} url={url} /> : <BanButton ip={request.ip} url={url} />}
                                </td>
                            )}
                        </tr>
                    )): (
                        <tr className='hover'>
                            <td colSpan={8} className='p-4 align-middle text-center [&:has([role=checkbox])]:pr-0 h-12'>No requests found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

async function BanButton({ip, url}: {ip: string, url: string}) {
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
        } catch (e){
            console.error(e)
        }
    }

    return (
        <button className='btn btn-sm btn-error' onClick={banIP}>Ban</button>
    )
}

async function UnBanButton({ip, url}: {ip: string, url: string}) {
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
        } catch (e){
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