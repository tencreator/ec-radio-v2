import Link from 'next/link'
import { auth } from '@/utils/auth'
import { hasPermission, Permissions } from '@/utils/permissions'

export default async function Header(): Promise<JSX.Element> {
    const session = await auth()

    const hasStaffPerms = session ? await hasPermission(session, Permissions.VIEW_STAFF) : false

    return (
        <header>
            <div className="navbar bg-base-200 border-b-2 border-solid border-base-300">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="menu menu-sm dropdown-content bg-base-200 rounded-box z-50 mt-3 w-52 p-2 shadow border border-solid border-base-300">
                            <li><Link href="/">Home</Link></li>
                            <li><Link href="/timetable">Timetable</Link></li>
                            {hasStaffPerms && <li><Link href="/staff">Staff</Link></li>}
                            <li><Link href='/auth'>{session ? 'Logout' : 'Login'}</Link></li>
                        </ul>
                    </div>
                    <Link className="btn btn-ghost text-xl" href="/"><h1>Emerald Coast Radio</h1></Link>
                </div>
                <div className="navbar-end hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/timetable">Timetable</Link></li>
                        {hasStaffPerms && <li><Link href="/staff">Staff</Link></li>}
                        <li><Link href='/auth'>{session ? 'Logout' : 'Login'}</Link></li>
                    </ul>
                </div>
            </div>
        </header>
    )
}