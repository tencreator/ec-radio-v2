import ViewPolicies from "@/components/staff/policies/viewPolicies"
import Layout from "../layout"
import { Permissions } from "@/utils/permissions"
import { PrismaClient } from "@prisma/client"

export default function Page() {
    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
            <h1 className="text-2xl font-bold">Policies</h1>
            <ViewPolicies />
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_POLICIES}>{page}</Layout>