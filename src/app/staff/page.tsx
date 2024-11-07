import { use } from "react"
import { auth, signOut } from "@/utils/auth"

import { Permissions } from "@/utils/permissions"
import Layout from "./layout"

export default async function Page() {
    const session = await auth()

    return (
        <div>
            <h1>Staff Page</h1>

            {JSON.stringify(session)}

            <button className="btn btn-info" onClick={async ()=>{
                "use server"
                await signOut()
            }}>Sign out</button>

            <h2></h2>
        </div>
    )
}

Page.getLayout = (page: any) => <Layout perm={Permissions.VIEW_STAFF}>{page}</Layout>