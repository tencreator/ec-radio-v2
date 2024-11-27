import ViewPolicy from "@/components/staff/directors/policies/editPolicy"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect, notFound } from "next/navigation"
import { headers, cookies } from "next/headers"
import Image from "next/image"
import { makeRequest } from "@/utils/request"

export default async function Page(context: any) {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.MANAGE_POLICIES)) return <div>Unauthorized</div>

    const params = await context.params
    if (!params.id) {
        return notFound()
    }
    
    async function getPolicy() {
        const res = await makeRequest(`/api/staff/policies/${params.id}`, {})
        const data = await res.json()
        return data
    }

    const policy = await getPolicy()

    return (
        <div className="mx-auto mt-4 container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Policy - {policy.name}</h1>
                    <p className="text-sm text-gray-500">Edit an exsiting policy that staff members need to folow!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="hidden md:flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>
            <ViewPolicy policy={policy} />
        </div>
    )
}