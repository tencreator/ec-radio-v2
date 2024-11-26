import ViewPolicy from "@/components/staff/policies/viewPolicy"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect, notFound } from "next/navigation"
import { headers, cookies } from "next/headers"
import Image from "next/image"
import { RefreshButton } from "@/components/utils/RefreshButton"

export default async function Page(context: any) {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_POLICIES)) return <div>Unauthorized</div>

    const params = await context.params
    if (!params.id) {
        return notFound()
    }

    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    const res = await fetch(`${url}/api/staff/policies/${params.id}`, {
        headers: { Cookie: (await cookies()).toString() }
    })
    if (res.status === 404) {
        return notFound()
    } else if (res.status === 403) {
        return <div>Unauthorized</div>
    }

    const policy = await res.json()

    return (
        <div className="mx-auto mt-4 container">
            <div className="flex flex-row">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-semibold">Policy - {policy.name}</h1>
                    <p className="text-sm text-gray-500">Failure to adhead to this policy can and will resutlt in your permission to present on our radio station being revoked. Take this as your one and only warning</p>
                </div>
                <div className="grow flex flex-row justify-start items-end ml-4"><RefreshButton /></div>
                <div className="flex flex-row items-center">
                    <Image src={session?.user?.image || ''} className="rounded-full w-[32px] h-[32px] mr-2" width={32} height={32} alt="Profile Picture" />
                    <p>{session?.user?.displayName}</p>
                </div>
            </div>
            <ViewPolicy policy={policy} />
        </div>
    )
}