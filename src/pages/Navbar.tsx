import { Link, useLocation } from "react-router-dom";

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
    const location = useLocation();
    const isActive = location.pathname === to ||
        (to !== '/' && location.pathname.startsWith(to));

    return (
        <Link
            to={to}
            className={`transition-colors ${isActive
                ? 'text-blue-500'
                : 'text-white hover:text-blue-600'
                }`}
        >
            {children}
        </Link>
    );
}

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 bg-gray-800 w-full p-1 z-50">
            <div className="flex items-center justify-center flex-col space-y-1">
                <div className="">
                    <Link to="/" className="text-2xl font-bold text-blue-500 flex items-center">
                        <span className="material-icons mr-2">medical_services</span>
                        Sehat
                    </Link>
                </div>
                <div className="flex items-center justify-center space-x-8">
                    <NavLink to="/">Q&amp;A</NavLink>
                    <NavLink to="/diagnosis">Diagnosis</NavLink>
                    <NavLink to="/reasoning">Insights</NavLink>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;