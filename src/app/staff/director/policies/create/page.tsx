import CreatePolicy from "@/components/staff/directors/policies/createPolicy"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"

export default async function Page(context: any) {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.MANAGE_POLICIES)) return <div>Unauthorized</div>

    return (
        <div className="mx-auto mt-4 container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Policy - New Policy</h1>
                    <p className="text-sm text-gray-500">Create a policy for staff to follow!</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"></div>
                <div className="hidden md:flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>
            <CreatePolicy />
        </div>
    )
}