import ViewPolicies from "@/components/staff/policies/viewPolicies"
import Layout from "../layout"
import { Permissions } from "@/utils/permissions"

export default function Page() {
    return (
        <div className="mx-auto mt-4 w-10/12 lg:w-11/12">
        <div>
            <h1 className="text-3xl font-semibold">Policies</h1>
            <p className="text-sm text-gray-500">This is where you view our policies!</p>
        </div>
            <ViewPolicies />
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_POLICIES}>{page}</Layout>