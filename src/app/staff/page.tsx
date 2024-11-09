import { auth } from "@/utils/auth"

import { Permissions } from "@/utils/permissions"
import Layout from "./layout"

export default async function Page() {
    const session = await auth()

    return (
        <div className="mx-auto mt-4 lg:w-10/12">
            <h1 className="text-3xl font-bold">Staff Home</h1>
            <p>Welcome to the staff home page.</p>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_STAFF}>{page}</Layout>