import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import App from "../App";

import axios from "../api/axios";
import AuthContext from "../context/AuthProvider";
import { AxiosError } from "axios";

const LOGIN_URL: string = "/api/v1/login";

const Login = (): JSX.Element => {
    const userRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null);

    const Auth = useContext(AuthContext);

    const [user, setUser] = useState<string>("");
    const [pwd, setPwd] = useState<string>("");
    const [errMsg, setErrMsg] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        userRef.current?.focus();
    }, []);

    useEffect(() => {
        setErrMsg("");
    }, [user, pwd]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios
            .post(
                LOGIN_URL,
                { name: user, password: pwd },
                {
                    headers: { "Content-Type": "application/json" },
                    withCredentials: true,
                }
            )
            .then((success) => {
                // const accessToken = response?.data?.accessToken; response = await axios.post etc etc
                Auth.setAuth({ user, loggedIn: true });
                //Reset User inputs
                setUser("");
                setPwd("");
                setSuccess(true);
            })
            .catch((err) => {
                if (err instanceof AxiosError) {
                    console.log(err);
                    setErrMsg(err.response?.data.error);
                } else setErrMsg("Login Failed");
            });
    };

    return (
        <>
            {success ? (
                { App }
            ) : (
                <div className="flex flex-col h-screen">
                    <div className="navbar-wrapper">
                        <div className="relative flex items-center justify-start content-start h-auto w-auto mt-2 mb-2 mx-auto text-4xl text-orange-500 antialiased">
                            OrgaNiUS
                        </div>
                    </div>
                    <section className="flex grow mt-20 justify-center items-center overflow-auto g-6 text-gray-800">
                        <div className="md:w-8/12 lg:w-6/12 lg:ml-20 justify-center items-center max-w-2xl">
                            <span className="text-3xl justify-center items-center text-center ">
                                Welcome to OrgaNiUS!
                            </span>
                            <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"}>
                                {errMsg}
                            </p>
                            <form data-testid="login-form" className="mt-3" onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <input
                                        type="text"
                                        id="username"
                                        ref={userRef}
                                        onChange={(e) => setUser(e.target.value)}
                                        value={user}
                                        className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                        placeholder="Username"
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
                                        <label
                                            className="form-check-label inline-block text-gray-800"
                                            htmlFor="exampleCheck2"
                                        >
                                            Remember me
                                        </label>
                                    </div>

                                    <Link
                                        data-testid="forgot_pwd"
                                        to="/forgot_pwd"
                                        className="text-blue-600 hover:text-blue-700 focus:text-blue-700 active:text-blue-800 duration-200 transition ease-in-out hover:underline"
                                    >
                                        Forgot password?
                                    </Link>
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
                                    onClick={() => navigate("/registration")}
                                >
                                    Register
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
};

export default Login;
