import { hasPermission, type PagePermissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"
import { redirect } from "next/navigation";

import Sidebar from "@/components/staff/sidebar"

interface StaffLayoutProps {
    children: React.ReactNode;
    perm: PagePermissions;
}

const StaffLayout = async ({ children, perm }: StaffLayoutProps) => {
    const session = await auth()

    if (!session) {
        redirect('/auth')
    }
    if (!await hasPermission(session, perm)) return <div>Unauthorized</div>

    return (
        <section className="flex flex-row">
            <Sidebar perms={session?.user.perms || []} />
            <main>
                {children}
            </main>
        </section>
    )
}

const withAsync = (Component: any) => {
    return (props: any) => (
        <Component {...props} />
    )
}

export default withAsync(StaffLayout)