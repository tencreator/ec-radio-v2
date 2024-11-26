import { Permissions, hasPermission} from "@/utils/permissions"
import { Suspense } from "react"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import Table from "@/components/utils/Table";
import Image from "next/image"


async function getUrl(): Promise<string> {
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    return `${protocol}://${host}`
}

async function fetchData(filter?: string, max: number = 10, offset: number = 0) {
    const url = await getUrl()
    let uri = `?max=${encodeURIComponent(max)}&offset=${encodeURIComponent(offset)}`
    if (filter) uri += `&filter=${encodeURIComponent(filter)}`

    const response = await fetch(`${url}/api/staff/mentor/timetable${uri}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': (await cookies()).toString()
        }
    })

    if (!response.ok) return []
    const data = await response.json()

    return data.logs
}

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.OTHERS_TIMETABLE)) return <div>Unauthorized</div>

    const data = await fetchData()

    return (
        <div className="mx-auto mt-4 overflow-auto container">
                <div className="flex flex-row">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-semibold">Timetable Logs</h1>
                        <p className="text-sm text-gray-500">View how our presenters have been interacting with the timetable!!</p>
                    </div>
                    <div className="grow flex flex-row justify-start items-end ml-4"></div>
                    <div className="hidden md:flex flex-row items-center">
                        <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                        <p>{session?.user?.displayName}</p>
                    </div>
                </div>

            <Suspense fallback={<div>Loading...</div>}>
                <div className="mt-4 flex flex-col gap-4 overflow-x-scroll md:overflow-auto">
                    <h2>TODO: Make this a timeline filterable by action and username</h2>

                    <Table headings={[
                        "Date",
                        "Time",
                        "Action",
                        "User",
                        "Processed At"
                    ]} data={data} />
                </div>
            </Suspense>
        </div>
    )
}

