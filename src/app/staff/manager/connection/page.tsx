import { hasPermission, Permissions } from "@/utils/permissions"
import { Suspense } from "react"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation"
import Image from 'next/image'
import Table, { TableSkeleton } from "@/components/utils/Table"
import { makeRequest } from "@/utils/request"
import RevokeButton from "@/components/staff/manager/manager/RevokeButton"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.MANAGE_CONNECTIONS)) return <div>Unauthorized</div>

    async function getAccounts() {
        const accounts = await makeRequest('/api/staff/presenter/connection?all=true', {})
        const data = await accounts.json()

        const accountsData = await Promise.all(data.map((account: any) => {
            return {
                id: account.id,
                azuracast_id: account.azuraid,
                username: account.name,
                user: {
                    id: account.user.id,
                    name: account.user.displayName,
                    avatar: account.user.avatar
                },
                revoke: <RevokeButton id={account.id} />
            }
        }))

        return accountsData
    }

    return (
        <div className="mx-auto mt-4 overflow-auto container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Manage Connections</h1>
                    <p className="text-sm text-gray-500">Here you can revoke presenter's connection details so they cannot go live and have to generate new ones.</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="hidden md:flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <Suspense fallback={<PageSkeleton />}>
                <Table headings={["ID", "Azuracast ID", "Username", "User", "Revoke"]} data={await getAccounts()} />
            </Suspense>
        </div>
    )
}

async function PageSkeleton() {
    return (
        <div className="flex flex-col mt-6">
            <TableSkeleton headings={["ID", "Azuracast ID", "Username", "User", "Revoke"]} />
        </div>
    )
}