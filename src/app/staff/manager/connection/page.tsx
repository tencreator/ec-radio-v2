import { hasPermission, Permissions } from "@/utils/permissions"
import { Suspense } from "react"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation";
import Image from 'next/image'
import { TableSkeleton } from "@/components/utils/Table";

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.MANAGE_CONNECTIONS)) return <div>Unauthorized</div>

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
                <PageSkeleton />
            </Suspense>
        </div>
    )
}

async function PageSkeleton() {
    return (
        <div className="flex flex-col mt-6">
            <TableSkeleton headings={["ID", "Username", "User", "Revoke"]} />
        </div>
    )
}