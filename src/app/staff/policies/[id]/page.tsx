import ViewPolicy from "@/components/staff/policies/viewPolicy"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect, notFound } from "next/navigation"
import { headers, cookies } from "next/headers"

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
            <h1 className="text-2xl font-bold">Policy - {policy.name}</h1>
            <ViewPolicy policy={policy} />
        </div>
    )
}