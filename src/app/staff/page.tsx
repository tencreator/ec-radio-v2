import { Permissions } from "@/utils/permissions"
import Layout from "./layout"
import Stats from "@/components/staff/stats/stats"
import { auth } from "@/utils/auth"

export default async function Page() {
    const session = await auth()

    return (
        <div className="mx-auto mt-4 lg:w-11/12">
            <Stats perms={session?.user.perms || []} />
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_STATS}>{page}</Layout>