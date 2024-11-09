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

    if (!session) redirect('/auth')
    if (!await hasPermission(session, perm)) return <div>Unauthorized</div>

    return (
        <main className="flex flex-row min-h-full grow">
            <Sidebar perms={session?.user.perms || []} />
            <section className="grow">
                {children}
            </section>
        </main>
    )
}

const withAsync = (Component: any) => {
    return (props: any) => (
        <Component {...props} />
    )
}

export default withAsync(StaffLayout)