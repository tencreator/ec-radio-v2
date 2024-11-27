import { Skeleton } from "@/components/staff/directors/policies/viewPolicies"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect } from "next/navigation"
import Image from "next/image"
import { Suspense } from "react"
import { makeRequest } from "@/utils/request"
import CreatePerm from "@/components/staff/directors/permissions/CreatePage"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_PERMISSIONS)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 overflow-auto container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">New permission</h1>
                    <p className="text-sm text-gray-500">Create a new permission for a role in your discord server</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="hidden md:flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <Suspense fallback={<Skeleton />}>
                <div className="mt-4">
                    <CreatePerm />
                </div>
            </Suspense>
        </div>
    )
}