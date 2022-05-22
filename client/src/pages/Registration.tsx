import React from "react";
import {useNavigate} from "react-router-dom";
import {validEmail, validPassword, validUsername} from "../components/regex";

const Registration = (): JSX.Element => {

    const RegExpTest= (regex:RegExp, text:string): boolean => {
        return regex.test(text);
    }

    const navigate = useNavigate();

    return <div>
        <div className="navbar-wrapper">
            <div className="home-icon">
                OrgaNiUS
            </div>
        </div>
        <section className="relative h-full justify-center items-center overflow-hidden">
            <div className="flex justify-center items-center h-screen g-6 text-gray-800">
                <div className="md:w-8/12 lg:w-6/12 lg:ml-20 justify-center items-center max-w-2xl">
                            <span className="text-3xl justify-center items-center text-center ">
                                OrgaNiUS Registration
                            </span>
                    <form className="mt-3">
                        <div className="mb-6">
                            <input
                                type="text"
                                id="username"
                                className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Username (Min. 5 characters)"

                                required
                            />
                        </div>

                        <div className="mb-6">
                            <input
                                type="text"
                                id="username"
                                className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Email address"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <input
                                type="password"
                                id="password"
                                className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Password"

                                required
                            />
                        </div>

                        <div className="mb-6">
                            <input
                                type="password"
                                id="password"
                                className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                placeholder="Re-Enter Your Password"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-2 inline-block px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out w-full"
                            data-mdb-ripple="true"
                            data-mdb-ripple-color="light"
                            onClick={() => navigate('/registration')}
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </section>
    </div>;
}
export default Registration;