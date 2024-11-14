import { Permissions } from "@/utils/permissions"
import Layout from "@/app/staff/layout"
import { Suspense } from "react"
import { auth } from "@/utils/auth"
import { cookies, headers } from "next/headers"
import ToggleRequestsButton from "@/components/staff/presenters/requests/ToggleButton"

export default async function Page() {
    const session = await auth()
    
    const headerList = await headers()
    const protocol = headerList.get('x-forwarded-proto') || 'http'
    const host = headerList.get('host')
    const url = `${protocol}://${host}`

    async function getRequestStatus() {
        const res = await fetch(`${url}/api/requests/status`)
        const data = await res.json()

        return data
    }

    async function toggleRequests() {
        const res = await fetch(`${url}/api/requests/status`, {
            method: 'POST',
            headers: {
                cookies: (await cookies()).toString()
            }
        })
        const data = await res.json()

        return data
    }

    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <Suspense fallback={<div>Loading...</div>}>
                <div>
                    <h1 className="text-3xl font-semibold">Requests</h1>
                    <p className="text-sm text-gray-500">View and manage presenter requests</p>
                </div>
                <div className="mt-4 flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold">Toggle requests</h2>
                    <ToggleRequestsButton />
                </div>
                <div className="mt-4 flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold">Requests</h2>
                    <div>
                        <h3 className="text-xl font-medium">Song Requests</h3>
                        INSERT TABLE HERE
                    </div>
                    <div>
                        <h3 className="text-xl font-medium">Shoutout Requests</h3>
                        INSERT TABLE HERE
                    </div>
                    <div>
                        <h3 className="text-xl font-medium">Joke Requests</h3>
                        INSERT TABLE HERE
                    </div>
                </div>
            </Suspense>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_REQUESTS}>{page}</Layout>