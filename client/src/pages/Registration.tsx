import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  validEmail,
  validPassword,
  validPinCode,
  validUsername,
} from "../components/regex";
import axios from "../api/axios";
import App from "../App";

const Registration = (): JSX.Element => {
  const REGISTRATION_URL = "/api/v1/signup";
  const VERIFY_URL = "/api/v1/verify";

  const userRef = useRef<HTMLInputElement>(null);
  const mailRef = useRef<HTMLInputElement>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);

  const [mail, setMail] = useState("");
  const [validMail, setValidMail] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const [pin, setPin] = useState("");
  const [validPin, setValidPin] = useState(false);

  const [verifySuccess, setVerifySuccess] = useState(false);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    mailRef.current?.focus();
  }, []);

  useEffect(() => {
    setValidName(validUsername.test(user));
  }, [user]);

  useEffect(() => {
    setValidMail(validEmail.test(mail));
  }, [mail]);

  useEffect(() => {
    setValidPwd(!pwd.includes(user) && validPassword.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd]);

  useEffect(() => {
    setValidPin(validPinCode.test(pin));
  }, [pin]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(
        REGISTRATION_URL,
        JSON.stringify({ name: user, password: pwd, email: mail }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setSuccess(true);
    } catch (err) {
      setErrMsg("Registration Failed");
    }
  };

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post(VERIFY_URL, JSON.stringify({ name: user, pin }), {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      setVerifySuccess(true);
    } catch (err) {
      setErrMsg("Verification Failed");
    }
  };

  return (
    <>
      {verifySuccess ? (
        { App }
      ) : (
        <div className="flex flex-col h-screen">
          <div className="flex fixed top-0 left-0 w-screen h-20 m-0 flex-row bg-blend-color shadow-lg ">
            <Link
              to="/"
              className="relative flex items-center justify-start content-start h-auto w-auto mt-2 mb-2 mx-auto text-4xl text-orange-500 antialiased hover:text-orange-600"
            >
              OrgaNiUS
            </Link>
          </div>

          <div className="flex grow mt-20 justify-center items-center overflow-auto g-6 text-gray-800">
            <div className="md:w-8/12 lg:w-6/12 lg:ml-20 justify-center items-center max-w-2xl">
              <span className="text-3xl justify-center items-center text-center ">
                OrgaNiUS Registration
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
                    className={`form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid ${
                      !validName && user
                        ? "border-red-300"
                        : !user
                        ? "border-gray-300"
                        : "border-green-300"
                    } rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                    placeholder="Username (Min. 5 characters)"
                    required
                  />
                </div>

                <div className="mb-6">
                  <input
                    type="text"
                    id="email"
                    ref={mailRef}
                    onChange={(e) => setMail(e.target.value)}
                    className={`form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid ${
                      !(validMail || !mail)
                        ? "border-red-300"
                        : !mail
                        ? "border-gray-300"
                        : "border-green-300"
                    } rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                    placeholder="Email address"
                    required
                  />
                </div>

                <div className="mb-6">
                  <input
                    type="password"
                    id="password"
                    onChange={(e) => setPwd(e.target.value)}
                    className={`form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid ${
                      !(validPwd || !pwd)
                        ? "border-red-300"
                        : !pwd
                        ? "border-gray-300"
                        : "border-green-300"
                    } rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                    placeholder="Password"
                    required
                  />
                </div>

                <div className="mb-6">
                  <input
                    type="password"
                    id="confirm_password"
                    onChange={(e) => setMatchPwd(e.target.value)}
                    className={`form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid ${
                      !(validMatch || !matchPwd)
                        ? "border-red-300"
                        : !matchPwd
                        ? "border-gray-300"
                        : "border-green-300"
                    } rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                    placeholder="Re-Enter Your Password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    !validName || !validMail || !validPwd || !validMatch
                  }
                  className="mt-2 inline-block px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out w-full disabled:bg-gray-600 disabled:hover:shadow"
                  data-mdb-ripple="true"
                  data-mdb-ripple-color="light"
                >
                  Register
                </button>
              </form>
            </div>
          </div>

          <div
            className={`flex grow mt-20 justify-center items-center overflow-auto g-6 text-gray-800 ${
              success ? "visible" : "invisible"
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
                    className={`form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid ${
                      !validPin && pin
                        ? "border-red-300"
                        : !pin
                        ? "border-gray-300"
                        : "border-green-300"
                    } rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none`}
                    placeholder="Enter your 6 digit pin here"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={!validPin}
                  className="mt-2 inline-block px-7 py-3 bg-orange-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-orange-700 hover:shadow-lg focus:bg-orange-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-orange-800 active:shadow-lg transition duration-150 ease-in-out w-full disabled:bg-gray-600 disabled:hover:shadow"
                  data-mdb-ripple="true"
                  data-mdb-ripple-color="light"
                >
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Registration;
