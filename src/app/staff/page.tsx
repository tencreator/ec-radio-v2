import { auth } from "@/utils/auth"

import { Permissions } from "@/utils/permissions"
import Layout from "./layout"

export default async function Page() {
    const session = await auth()

    return (
        <div>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_STAFF}>{page}</Layout>