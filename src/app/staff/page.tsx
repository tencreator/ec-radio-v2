import { Permissions } from "@/utils/permissions"
import Layout from "./layout"
import Stats from "@/components/staff/stats/stats"

export default async function Page() {
    return (
        <div className="mx-auto mt-4 lg:w-11/12">
            <Stats />
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_STATS}>{page}</Layout>