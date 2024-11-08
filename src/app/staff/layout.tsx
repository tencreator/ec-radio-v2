import { hasPermission, type PagePermissions } from "@/utils/permissions"
import { auth } from "@/utils/auth"

import Sidebar from "@/components/staff/sidebar"
import Login from "@/components/auth/login"

interface StaffLayoutProps {
    children: React.ReactNode;
    perm: PagePermissions;
    redirect?: string;
}

const StaffLayout = async ({ children, perm, redirect }: StaffLayoutProps) => {
    const session = await auth()

    if (!session) return <Login redirect={redirect} />
    if (!hasPermission(session, perm)) return <div>Unauthorized</div>

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