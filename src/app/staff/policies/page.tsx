import ViewPolicies from "@/components/staff/policies/viewPolicies"
import { auth } from "@/utils/auth"
import { hasPermission, Permissions } from "@/utils/permissions"
import { redirect } from "next/navigation"
import { cookies, headers } from "next/headers"

export default async function Page() {
    const session = await auth()

    if (!session || !session.user || !session.user.providerId) redirect('/auth')
    if (!await hasPermission(session.user.providerId, Permissions.VIEW_POLICIES)) return <div>Unauthorized</div>

    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    const res = await fetch(`${url}/api/staff/policies`, {
        headers: { Cookie: (await cookies()).toString() }
    })

    return (
        <div className="mx-auto mt-4 container">
        <div>
            <h1 className="text-3xl font-semibold">Policies</h1>
            <p className="text-sm text-gray-500">This is where you view our policies!</p>
        </div>
            {
                res.ok ? (
                    <div>
                        <ViewPolicies res={res} />
                    </div>
                ) : (
                    <div>
                        <p>No policies found.</p>
                    </div>
                )
            }
        </div>
    )
}