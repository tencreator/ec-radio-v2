import { redirect } from "next/navigation"
import { hasPermission, Permissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"
import { makeRequest } from "@/utils/request"

import { Suspense } from "react"
import { TableSkeleton } from "@/components/utils/Table"
import ToggleRequestsButton from "@/components/staff/presenters/requests/ToggleButton"
import Table from "@/components/staff/presenters/requests/RequestsTable"
import Image from "next/image"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_REQUESTS)) return <div>Unauthorized</div>

    const isAcceptingRequests = await makeRequest('/api/requests/status', {}).then(res => res.json())

    return (
        <div className="mt-4 mx-auto overflow-auto container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Request</h1>
                    <p className="text-sm text-gray-500">Check the requests sent in from our adoring listeners!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="hidden md:flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-4">
                <h2 className="text-2xl font-semibold">Toggle requests</h2>
                <Suspense fallback={<div className="skeleton h-12 w-80"></div>}>
                    <ToggleRequestsButton acceptingRequests={isAcceptingRequests.acceptingRequests} />
                </Suspense>
            </div>
            <div className="mt-4 mx-auto flex flex-col gap-4">
                <div className="flex flex-row">
                    <h2 className="text-2xl font-semibold mr-4">Requests</h2>
                </div>
                <div>
                    <h3 className="text-xl font-medium">Song Requests</h3>
                    <Suspense fallback={<TableSkeleton headings={["Name", "Date", "Message", "Actions"]} />}>
                        <Table filter="song" />
                    </Suspense>
                </div>
                <div>
                    <h3 className="text-xl font-medium">Shoutout Requests</h3>
                    <Suspense fallback={<TableSkeleton headings={["Name", "Date", "Message", "Actions"]} />}>
                        <Table filter="shoutout" />
                    </Suspense>
                </div>
                <div>
                    <h3 className="text-xl font-medium">Joke Requests</h3>
                    <Suspense fallback={<TableSkeleton headings={["Name", "Date", "Message", "Actions"]} />}>
                        <Table filter="joke" />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}