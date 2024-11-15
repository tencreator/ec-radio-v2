import { Permissions } from "@/utils/permissions"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"

import { headers, cookies } from "next/headers"
import CreateButton from "@/components/staff/presenters/connection/CreateButton"
import DeleteButton from "@/components/staff/presenters/connection/DeleteButton"
import ViewDetails from "@/components/staff/presenters/connection/ViewDetails"

export default async function Page() {
    let connectionDetails: false | {azuraid: string, discordid: string, name: string, password: string} = await fetchConnectionDetails()

    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Connection</h1>
                    <p className="text-sm text-gray-500">Get your connection details below!</p>
                </div>

                <ViewDetails />
            </Suspense>
        </div>
    )
}

async function fetchConnectionDetails() {
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    const res = await fetch(`${url}/api/staff/presenter/connection`, {
        headers: { Cookie: (await cookies()).toString() }
    })

    if (res.status === 404) {
        return false
    } else {
        const data = await res.json()
        return data
    }
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_REQUESTS}>{page}</Layout>