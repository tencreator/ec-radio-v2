export default function Header(): JSX.Element {
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
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
                            <li><a href="/">Home</a></li>
                            <li><a href="/timetable">Timetable</a></li>
                        </ul>
                    </div>
                    <a className="btn btn-ghost text-xl" href="/"><h1>Emerald Coast Radio</h1></a>
                </div>
                <div className="navbar-end hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        <li><a href="/">Home</a></li>
                        <li><a href="/timetable">Timetable</a></li>
                    </ul>
                </div>
            </div>
        </header>
    )
}