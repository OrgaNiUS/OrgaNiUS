import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom";
import App from "../App";

const Login = (): JSX.Element => {

    const userRef = useRef(null);
    const errRef = useRef(null);

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = () => {
        setUser('');
        setPwd('');
        setSuccess(true);
    }

    return (
        <>
            {success ? {App} : (
                <div>
                    <div className="navbar-wrapper">
                        <div className="home-icon">
                            OrgaNiUS
                        </div>
                    </div>
                    <section className="relative h-full justify-center items-center overflow-hidden">
                        <div className="flex justify-center items-center h-screen g-6 text-gray-800">
                            <div className="md:w-8/12 lg:w-6/12 lg:ml-20 justify-center items-center max-w-2xl">
                            <span className="text-3xl justify-center items-center text-center ">
                                Welcome to OrgaNiUS!
                            </span>
                                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"}>{errMsg}</p>
                                <form className="mt-3" onSubmit={handleSubmit}>
                                    <div className="mb-6">
                                        <input
                                            type="text"
                                            id="username"
                                            ref={userRef}
                                            onChange={(e) => setUser(e.target.value)}
                                            value={user}
                                            className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                            placeholder="Email address or Username"
                                            required
                                        />
                                    </div>

                                    <div className="mb-6">
                                        <input
                                            type="password"
                                            id="password"
                                            onChange={(e) => setPwd(e.target.value)}
                                            value={pwd}
                                            className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                            placeholder="Password"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-between items-center mb-6">
                                        <div className="form-group form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                                id="rememberCheck"
                                            />
                                            <label className="form-check-label inline-block text-gray-800"
                                                   htmlFor="exampleCheck2"
                                            >Remember me
                                            </label>
                                        </div>

                                        <a
                                            href="pages/SignIn#!"
                                            className="text-blue-600 hover:text-blue-700 focus:text-blue-700 active:text-blue-800 duration-200 transition ease-in-out hover:underline"
                                        >Forgot password?
                                        </a>
                                    </div>

                                    <button
                                        type="submit"
                                        className="inline-block px-7 py-3 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"
                                        data-mdb-ripple="true"
                                        data-mdb-ripple-color="light"
                                    >
                                        Sign in
                                    </button>

                                    <button
                                        type="button"
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
                </div>
            )}
        </>)
}

export default Login;