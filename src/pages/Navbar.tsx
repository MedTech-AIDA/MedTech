import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function NavLink({ to, setOpen, children }: { to: string; setOpen: React.Dispatch<React.SetStateAction<boolean>>; children: React.ReactNode }) {
    const location = useLocation();
    const isActive = location.pathname === to ||
        (to !== '/' && location.pathname.startsWith(to));

    return (
        <Link
            to={to}
            onClick={() => { setOpen(false) }}
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

    const [open, setOpen] = useState(false);

    return (
        <nav className="text-white lg:flex items-center lg:py-3 lg:px-3 fixed top-0 left-0 bg-gray-800 w-full z-50 ">

            <div className="bg-gray-800 p-1 px-2 z-50">
                <Link to="/" onClick={() => { setOpen(false) }} className="text-2xl font-bold text-blue-500 flex items-center max-lg:w-28">
                    <span className="material-icons mr-2">medical_services</span>
                    Sehat
                </Link>
            </div>

            <div onClick={() => { setOpen(!open) }} className='lg:hidden absolute right-2 top-2'>
                {
                    open ? <div className="border p-1 flex items-center justify-center w-6 h-6 rounded-md font-semibold">X</div> : <span className="material-icons scale-125">menu</span>
                }
            </div>

            <div className={`absolute lg:static top-0 left-0 bg-gray-800 p-1 lg:flex lg:space-x-6 lg:pl-10 lg:ml-1 grid grid-cols-3 gap-4 text-center w-full max-lg:py-3 lg:z-auto -z-50 transition-all duration-500 ease-in-out ${open ? 'top-10' : 'top-[-1000px]'} lg:border-l-2 max-lg:border-t-2 max-lg:rounded-b-md`}>
                <NavLink to="/" setOpen={setOpen}>Q&amp;A</NavLink>
                <NavLink to="/diagnosis" setOpen={setOpen}>Diagnosis</NavLink>
                <NavLink to="/reasoning" setOpen={setOpen}>Insights</NavLink>
                <NavLink to="/about" setOpen={setOpen}>About Us</NavLink>
                <NavLink to="/contact" setOpen={setOpen}>Contact Us</NavLink>
            </div>

        </nav>
    )
}

export default Navbar;