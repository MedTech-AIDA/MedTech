import { useEffect } from "react";

const About = () => {

    useEffect(()=>{
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pb-6 sm:pb-8 lg:pb-12 relative overflow-hidden">
            <div className="mx-auto px-4 md:px-8 text-gray-700  pt-16 lg:pt-24">
                <h1 className="text-4xl font-bold text-center text-indigo-700">
                    About <span className="text-blue-500">MedTech</span>
                </h1>
                <p className="lg:w-4/5 text-justify lg:text-center mx-auto mb-8">
                    At <strong>MedTech</strong>, we believe in empowering individuals to take
                    charge of their health. In a world rapidly advancing in technology,
                    we bring innovation and care together - making healthcare more
                    accessible, proactive, and personalized.
                </p>

                <section className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-indigo-600 mb-2">What We Do</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>
                            <strong>Upload Health Reports:</strong> Easily upload diagnostic or medical reports
                            in a secure environment.
                        </li>
                        <li>
                            <strong>Get Intelligent Suggestions:</strong> Our system uses smart algorithms to
                            offer helpful insights and suggestions based on your report.
                        </li>
                        <li>
                            <strong>Connect with Doctors:</strong> Schedule checkups or consultations with
                            verified medical professionals.
                        </li>
                    </ul>
                </section>

                <section className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Why MedTech?</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-disc pl-5">
                        <li>AI-Powered Health Insights</li>
                        <li>Private & Secure Data Handling</li>
                        <li>Verified Medical Network</li>
                        <li>Accessible Anytime, Anywhere</li>
                    </ul>
                </section>

                <section className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-indigo-600 mb-2">Our Vision</h2>
                    <p>
                        We envision a world where no one is left behind in receiving quality
                        health support—where technology bridges the gap between people and
                        care.
                    </p>
                </section>

                <section className="bg-indigo-100 rounded-2xl shadow-md p-6 text-center">
                    <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                        Let's Build a Healthier Tomorrow
                    </h2>
                    <p className="text-lg">
                        Whether you're managing chronic conditions, curious about your
                        vitals, or seeking professional advice—<strong>MedTech</strong> is your
                        trusted digital ally.
                    </p>
                    <p className="mt-4 italic text-indigo-500">
                        "Your data, your health, your future — all safeguarded by MedTech."
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;

// const About = () => {
//     return (
//         <div className="min-h-screen bg-gradient-to-tr from-blue-100 via-white to-indigo-200 py-12 px-6 text-gray-800 font-sans">
//             <div className="max-w-6xl mx-auto">
//                 <h1
//                     className="text-5xl font-extrabold text-center text-indigo-700 mb-10"
//                 >
//                     Welcome to <span className="text-blue-500">Sehat</span>
//                 </h1>

//                 <section
//                     className="bg-white/80 backdrop-blur-lg border border-indigo-200 rounded-3xl shadow-2xl p-8 mb-8"
//                 >
//                     <h2 className="text-3xl font-semibold text-indigo-600 flex items-center gap-2 mb-4">
//                         {/* <Sparkles className="text-blue-400" /> Who We Are */}
//                         <span className="material-icons text-red-600 mr-3">error_outline</span>
//                     </h2>
//                     <p className="text-lg leading-relaxed">
//                         At <strong>Sehat</strong>, we bridge the gap between technology and
//                         healthcare. Our mission is to deliver futuristic solutions to help
//                         you stay on top of your health, anytime and anywhere.
//                     </p>
//                 </section>

//                 <div
//                     className="bg-white/80 backdrop-blur-lg border border-indigo-200 rounded-3xl shadow-2xl p-8 mb-8"
//                 >
//                     <h2 className="text-3xl font-semibold text-indigo-600 flex items-center gap-2 mb-4">
//                         {/* <BrainCircuit className="text-blue-400" /> What We Do */}
//                         <span className="material-icons text-red-600 mr-3">error_outline</span>
//                     </h2>
//                     <div className="grid md:grid-cols-3 gap-6 text-lg">
//                         <div className="flex flex-col items-center text-center">
//                             {/* <UploadCloud className="w-10 h-10 text-indigo-500 mb-2" /> */}
//                             <span className="material-icons text-red-600 mr-3">error_outline</span>
//                             <p><strong>Upload Reports</strong> safely and securely to our cloud.</p>
//                         </div>
//                         <div className="flex flex-col items-center text-center">
//                             {/* <Sparkles className="w-10 h-10 text-indigo-500 mb-2" /> */}
//                             <span className="material-icons text-red-600 mr-3">error_outline</span>
//                             <p><strong>Get Smart Suggestions</strong> based on your health data.</p>
//                         </div>
//                         <div className="flex flex-col items-center text-center">
//                             {/* <Stethoscope className="w-10 h-10 text-indigo-500 mb-2" /> */}
//                             <span className="material-icons text-red-600 mr-3">error_outline</span>
//                             <p><strong>Consult Doctors</strong> with just a few clicks.</p>
//                         </div>
//                     </div>
//                 </div>

//                 <div
//                     className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-3xl shadow-2xl p-8 mb-8 border border-indigo-200"
//                 >
//                     <h2 className="text-3xl font-semibold text-indigo-700 mb-4 text-center">
//                         Why Choose Sehat?
//                     </h2>
//                     <ul className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-lg">
//                         <li className="flex items-center gap-2"><span className="material-icons text-red-600 mr-3">error_outline</span>AI-Powered Health Insights</li>
//                         <li className="flex items-center gap-2"><span className="material-icons text-red-600 mr-3">error_outline</span> Secure & Private Data Handling</li>
//                         <li className="flex items-center gap-2"><span className="material-icons text-red-600 mr-3">error_outline</span> Verified Medical Network</li>
//                         <li className="flex items-center gap-2"><span className="material-icons text-red-600 mr-3">error_outline</span> 24/7 Accessibility Anywhere</li>
//                     </ul>
//                 </div>

//                 <div
//                     className="bg-white/90 backdrop-blur-md rounded-3xl border border-indigo-200 p-8 mb-10 shadow-xl"
//                 >
//                     <h2 className="text-3xl font-semibold text-indigo-700 mb-4">Our Vision</h2>
//                     <p className="text-lg leading-relaxed">
//                         We imagine a future where healthcare is not reactive, but proactive;
//                         where you are not just a patient, but an empowered participant in
//                         your health journey.
//                     </p>
//                 </div>

//                 <div
//                     className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-3xl p-10 text-center shadow-2xl"
//                 >
//                     <h2 className="text-3xl font-bold mb-4">Let's Build a Healthier Tomorrow</h2>
//                     <p className="text-lg">
//                         Whether you're managing chronic issues or simply staying informed,
//                         <strong> Sehat</strong> is your futuristic companion in wellness.
//                     </p>
//                     <p className="mt-6 italic text-blue-100">
//                         "Your data, your health, your future — all safeguarded by Sehat."
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default About;