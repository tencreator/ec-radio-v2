import { type PagePermissions } from "@/utils/permissions"
import Sidebar from "@/components/staff/sidebar.server"

interface StaffLayoutProps {
    children: React.ReactNode;
}

const StaffLayout = async ({ children }: StaffLayoutProps) => {
    return (
        <main className="flex flex-row min-h-full grow">
            <Sidebar />
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