import { Skeleton } from "@/components/staff/directors/policies/viewPolicies"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect } from "next/navigation"
import Image from "next/image"
import { Suspense } from "react"
import PermList from "@/components/staff/directors/permissions/View"
import { makeRequest } from "@/utils/request"
import Link from "next/link"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_PERMISSIONS)) return <div>Unauthorized</div>

    async function getPermissions() {
        const res = await makeRequest('/api/staff/director/permissions', {})
        const data = await res.json()
        return data
    }

    const perms = await getPermissions() as any

    return (
        <div className="mx-auto mt-4 overflow-auto container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Permissions Page</h1>
                    <p className="text-sm text-gray-500">Here you can assign permissions to certain roles in your discord server!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="hidden md:flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>

            <Suspense fallback={<Skeleton />}>
                <div className="mt-4">
                    <Link href="/staff/director/permissions/create" className="btn btn-primary btn-sm">New Permission</Link>
                    <PermList perms={perms} />
                </div>
            </Suspense>
        </div>
    )
}