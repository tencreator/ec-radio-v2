import ViewPolicy from "@/components/staff/policies/viewPolicy"
import Layout from "../../layout"
import { Permissions } from "@/utils/permissions"
import { notFound } from "next/navigation"
import { headers, cookies } from "next/headers"

export default async function Page(context: any) {
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
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <h1 className="text-2xl font-bold">Policy - {policy.name}</h1>
            <ViewPolicy policy={policy} />
        </div>
    )
}

Page.getLayout = (page: any) => (
    <Layout perm={Permissions.VIEW_POLICIES}>{page}</Layout>
)