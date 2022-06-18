import React, {useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {validPassword, validPinCode, validUsername,} from "../components/regex";
import axios from "../api/axios";
import {AxiosError} from "axios";

const ForgotPwd = (): JSX.Element => {
    const FORGOT_PWD_URL = "/api/v1/forgot_pw";
    const VERIFY_PIN_URL = "/api/v1/verify_forgot_pw";
    const CHANGE_PWD_URL = "/api/v1/change_forgot_pw";

    const navigate = useNavigate();

    const userRef = useRef<HTMLInputElement>(null);
    const errRef = useRef<HTMLParagraphElement>(null);

    const [user, setUser] = useState("");
    const [validName, setValidName] = useState(false);

    const [pwd, setPwd] = useState("");
    const [validPwd, setValidPwd] = useState(false);

    const [matchPwd, setMatchPwd] = useState("");
    const [validMatch, setValidMatch] = useState(false);

    const [pin, setPin] = useState("");
    const [validPin, setValidPin] = useState(false);

    const [errMsg, setErrMsg] = useState("");
    const [success, setSuccess] = useState(false);
    const [verifySuccess, setVerifySuccess] = useState(false);
    // const [resetSuccess, setResetSuccess] = useState(true);

    useEffect(() => {
        userRef.current?.focus();
    }, []);

    useEffect(() => {
        setValidName(validUsername.test(user));
    }, [user]);

    useEffect(() => {
        setValidPwd(!pwd.includes(user) && validPassword.test(pwd));
        setValidMatch(pwd === matchPwd);
    }, [pwd, matchPwd, user]);

    useEffect(() => {
        setValidPin(validPinCode.test(pin));
    }, [pin]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios.post(
            FORGOT_PWD_URL,
            {name: user},
            {
                headers: {"Content-Type": "application/json"},
                withCredentials: true,
            }
        ).then((success) => {
            setSuccess(true);
        }).catch((err) => {
            if (err instanceof AxiosError) {
                console.log(err);
                setErrMsg(err.message);
            } else setErrMsg("Username Error");
        });
    };

    const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios.post(
            VERIFY_PIN_URL,
            {name: user, pin},
            {
                headers: {"Content-Type": "application/json"},
                withCredentials: true,
            }
        ).then((success) => {
            setVerifySuccess(true);
        }).catch((err) => {
            if (err instanceof AxiosError) {
                console.log(err);
                setErrMsg(err.message);
            } else setErrMsg("Verify Pin Error");
        });
    };

    const handleChangePwd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        axios.post(
            CHANGE_PWD_URL,
            {name: user, pin, password: pwd},
            {
                headers: {"Content-Type": "application/json"},
                withCredentials: true,
            }
        ).then((success) => {
            // setResetSuccess(true);
            navigate('/');
        }).catch((err) => {
            if (err instanceof AxiosError) {
                console.log(err);
                setErrMsg(err.message);
            } else setErrMsg("Reset Password Error");
        });
    };

    return (
        <>

            <div className="flex flex-col h-screen">
                <div className="flex fixed top-0 left-0 w-screen h-20 m-0 flex-row bg-blend-color shadow-lg ">
                    <Link
                        to="/"
                        className="relative flex items-center justify-start content-start h-auto w-auto mt-2 mb-2 mx-auto text-4xl text-orange-500 antialiased hover:text-orange-600"
                    >
                        OrgaNiUS
                    </Link>
                </div>

                <div className={`flex grow mt-20 justify-center items-center overflow-auto g-6 text-gray-800 ${
                    !verifySuccess && !success ? "" : "hidden"
                }`}>
                    <div className="md:w-8/12 lg:w-6/12 lg:ml-20 justify-center items-center max-w-2xl">
              <span data-testid='fgt-pwd-indicator' className="text-3xl justify-center items-center text-center ">
                OrgaNiUS Reset Password
              </span>
                        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"}>
                            {errMsg}
                        </p>
                        <form onSubmit={handleSubmit} className="mt-3">
                            <div className="mb-6">
                                <input
                                    type="text"
                                    id="username"
                                    ref={userRef}
                                    onChange={(e) => setUser(e.target.value)}
                                    className={`form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                                    placeholder="Enter your Username here"
                                    required
                                />
                                <p className={`${user && !validName ? 'errmsg' : 'hidden'}`}>
                                    At least 5 characters long.<br/>
                                    Only contains alphanumeric characters.<br/>
                                    Allowed special characters ' ', '_', '.'
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!validName}
                                className="mt-2 inline-block px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out w-full disabled:bg-gray-600 disabled:hover:shadow"
                                data-mdb-ripple="true"
                                data-mdb-ripple-color="light"
                            >
                                Enter
                            </button>
                        </form>
                    </div>
                </div>

                <div
                    className={`flex grow mt-20 justify-center items-center overflow-auto g-6 text-gray-800 ${
                        !verifySuccess && success ? "" : "hidden"
                    }`}
                >
                    <div className="md:w-8/12 lg:w-6/12 lg:ml-20 justify-center items-center max-w-2xl">
                            <span className="text-3xl justify-center items-center text-center ">
                                Email Verification
                            </span>
                        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"}>
                            {errMsg}
                        </p>
                        <form onSubmit={handleVerify} className="mt-3">
                            <div className="mb-6">
                                <input
                                    type="text"
                                    id="pin"
                                    onChange={(e) => setPin(e.target.value)}
                                    className={`form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border-gray-300 bg-clip-padding border border-solid ${
                                        !validPin && pin
                                            ? "uppercase"
                                            : !pin
                                                ? ""
                                                : "uppercase"
                                    } rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                                    placeholder="Enter your 6 digit pin here"
                                    required
                                />
                                <p className={`${pin && !validPin ? 'errmsg' : 'hidden'}`}>
                                    Pin is a 6 Digit AlphaNumeric value.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!validPin}
                                className="mt-2 inline-block px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out w-full disabled:bg-gray-600 disabled:hover:shadow"
                                data-mdb-ripple="true"
                                data-mdb-ripple-color="light"
                            >
                                Submit Pin
                            </button>
                        </form>
                    </div>
                </div>

                <div
                    className={`flex grow mt-20 justify-center items-center overflow-auto g-6 text-gray-800 ${
                        verifySuccess ? "" : "hidden"
                    }`}
                >
                    <div className="md:w-8/12 lg:w-6/12 lg:ml-20 justify-center items-center max-w-2xl">
                            <span className="text-3xl justify-center items-center text-center ">
                                Change password
                            </span>
                        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"}>
                            {errMsg}
                        </p>
                        <form onSubmit={handleChangePwd} className="mt-3">
                            <div className="mb-6">
                                <input
                                    type="password"
                                    id="password"
                                    onChange={(e) => setPwd(e.target.value)}
                                    className={`form-control block w-full px-4 py-2 text-xl font-normal border-gray-300 text-gray-700 bg-white bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                                    placeholder="New Password"
                                    required
                                />
                                <p className={`${pwd && !validPwd ? 'errmsg' : 'hidden'}`}>
                                    At least 8 characters long.<br/>
                                    Contains at least 1 uppercase, 1 lowercase and 1 digit.<br/>
                                    Does not contain username.
                                </p>
                            </div>

                            <div className="mb-6">
                                <input
                                    type="password"
                                    id="matchPassword"
                                    onChange={(e) => setMatchPwd(e.target.value)}
                                    className={`form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                                    placeholder="Re-Enter your new Password"
                                    required
                                />
                                <p className={`${matchPwd && !validMatch ? 'errmsg' : 'hidden'}`}>
                                    Does not match password
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={!(validPwd && validMatch)}
                                className="mt-2 inline-block px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out w-full disabled:bg-gray-600 disabled:hover:shadow"
                                data-mdb-ripple="true"
                                data-mdb-ripple-color="light"
                            >
                                CHANGE PASSWORD
                            </button>
                        </form>
                    </div>
                </div>
            </div>

        </>
    );
};
export default ForgotPwd;
