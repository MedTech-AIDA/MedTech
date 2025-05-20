
const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <div className="text-2xl font-bold">Sehat</div>
                        <p className="text-gray-400">Advanced Medical Diagnosis System</p>
                    </div>
                    <div className="flex gap-8">
                        <div>
                            <h3 className="font-semibold mb-2">Resources</h3>
                            <ul className="space-y-1 text-gray-400">
                                <li><a href="#" className="hover:text-blue-400">Documentation</a></li>
                                <li><a href="#" className="hover:text-blue-400">API Reference</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Legal</h3>
                            <ul className="space-y-1 text-gray-400">
                                <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400">
                    © {new Date().getFullYear()} Sehat. All rights reserved.
                </div>
            </div>
        </footer>
    )
}

export default Footer
