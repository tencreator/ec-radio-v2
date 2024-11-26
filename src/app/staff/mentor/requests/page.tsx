import { Permissions, hasPermission } from "@/utils/permissions"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"
import Table from "@/components/staff/mentor/requests/Table"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation";
import Image from "next/image"
import { RefreshButton } from "@/components/utils/RefreshButton"
import { TableSkeleton } from "@/components/utils/Table"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_STATS)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Request Logs</h1>
                    <p className="text-sm text-gray-500">Check what requests has been processed and ban certain IPs if you dare!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"><RefreshButton /></div>
                <div className="flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <div className="mt-4 mx-auto flex flex-col gap-4">
                <div>
                    <h3 className="text-xl font-medium">Song Requests</h3>
                    <Suspense fallback={<TableSkeleton headings={["Name", "Date", "Message", "Status", "IP", "Processed By", "Processed At"]} />}>
                        <Table filter="song" />
                    </Suspense>
                </div>
                <div>
                    <h3 className="text-xl font-medium">Shoutout Requests</h3>
                    <Suspense fallback={<TableSkeleton headings={["Name", "Date", "Message", "Status", "IP", "Processed By", "Processed At"]} />}>
                        <Table filter="shoutout" />
                    </Suspense>
                </div>
                <div>
                    <h3 className="text-xl font-medium">Joke Requests</h3>
                    <Suspense fallback={<TableSkeleton headings={["Name", "Date", "Message", "Status", "IP", "Processed By", "Processed At"]} />}>
                        <Table filter="joke" />
                    </Suspense>
                </div>
            </div>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.MANAGE_REQUESTS}>{page}</Layout>