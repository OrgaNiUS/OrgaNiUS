import AuthContext from "../context/AuthProvider";
import Modal from "../components/Modal";
import React, { useContext, useEffect, useState } from "react";
import StylesMerger from "../styles/StyleMerging";
import axios from "../api/axios";
import styles from "../styles/Settings.module.css";
import { toTitleCase } from "../functions/strings";
import { validEmail, validPassword, validUsername } from "../components/regex";
import { useNavigate } from "react-router-dom";

// when updating this interface Fields, do remember to update the following sections as well
// keys array
// validityChecks object in Settings
interface Fields {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
}

const defaultFields: Fields = {
    name: "",
    email: "",
    password: "",
    confirm_password: "",
};

const GET_SELF_URL: string = "api/v1/own_user";
const USER_PATCH_URL: string = "api/v1/user";
const DELETE_ACC_URL: string = "api/v1/user";

// ensure these keys match the keys of interface Fields
// keyof Fields is there to prevent extra keys (but cannot prevent missing/duplicate keys, no other better yet simple solution)
// https://stackoverflow.com/questions/43909566/get-keys-of-a-typescript-interface-as-array-of-strings
const keys: (keyof Fields)[] = ["name", "email", "password"];

const styler = StylesMerger(styles);

const Settings = (): JSX.Element => {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const [selection, setSelection] = useState<typeof keys[number]>();
    const [fields, setFields] = useState<Fields>(defaultFields);
    const [message, setMessage] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    // Validates the input fields.
    // Currently called before form submission.
    const validityChecks: { [key: string]: () => boolean } = {
        name: () => {
            const name: string = fields["name"];
            return validUsername.test(name);
        },
        email: () => {
            const email: string = fields["email"];
            return validEmail.test(email);
        },
        password: () => {
            const name: string = auth.auth.user || "";
            const password: string = fields["password"];
            const confirm_password: string = fields["confirm_password"];
            if (password !== confirm_password) {
                return false;
            } else if (password.includes(name)) {
                return false;
            }
            return validPassword.test(password);
        },
    };

    useEffect(() => {
        // get user name and email and populate fields on page load
        axios
            .get(GET_SELF_URL)
            .then((response) => {
                const data = response.data;
                setFields((f) => {
                    return { ...f, name: data["name"], email: data["email"] };
                });
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    const handleClick = (key: keyof Fields) => {
        setSelection(key);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        setFields({ ...fields, [event.target.name]: event.target.value });
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const key: keyof Fields = selection as keyof Fields;

        if (!validityChecks[key]()) {
            // If fail checks, display error message for the user to see.
            setMessage("Input is invalid!");
            return;
        }

        // Only send the single field we are editing (even though the backend supports multiple)
        const payload = {
            [key]: fields[key],
        };

        axios
            .patch(USER_PATCH_URL, payload)
            .then((response) => {
                if (key === "name") {
                    // when name changes, update the context
                    auth.setAuth((current) => {
                        return {
                            user: response.data["name"],
                            loggedIn: current.loggedIn,
                        };
                    });
                }

                // Exit the "edit" mode
                setSelection(undefined);

                // Delete any previous message.
                setMessage("");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const dismissMessage: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        setMessage("");
    };

    const handleConfirmDelete: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        axios
            .delete(DELETE_ACC_URL)
            .then((resp) => {
                auth.setAuth({
                    user: undefined,
                    loggedIn: false,
                });
                navigate("/");
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const DeleteModal = (
        <>
            <div>
                <svg
                    // SVG from https://heroicons.com/
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-8 pr-2 align-bottom inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                Are you sure you want to delete this account?
            </div>
            <div>This is irreversible.</div>
            <button className={`float-right ml-3 mt-4 ${styler("confirmDelete")}`} onClick={handleConfirmDelete}>
                Confirm
            </button>
            <button
                className={styler("confirmCancel")}
                onClick={() => {
                    setShowDeleteModal(false);
                }}
            >
                Cancel
            </button>
        </>
    );

    return (
        <>
            <Modal
                {...{
                    active: showDeleteModal,
                    body: DeleteModal,
                    callback: () => {
                        setShowDeleteModal(false);
                    },
                }}
            />
            <div className="flex flex-col relative top-20 margin-top">
                <div className="mx-20 mt-10 justify-center items-center">
                    <div className={styler("left", "centered")}>
                        <h1 className={styler("header1")}>Settings</h1>
                        {keys.map((key, i) => {
                            return (
                                <div>
                                    <button className={styler("changeButton")} key={i} onClick={() => handleClick(key)}>
                                        {`Change ${toTitleCase(key)}`}
                                    </button>
                                </div>
                            );
                        })}
                        <button className={`mt-1 ${styler("confirmDelete")}`} onClick={() => setShowDeleteModal(true)}>
                            Delete Account
                        </button>
                    </div>
                    <div className={styler("right", "centered")}>
                        {selection === undefined ? (
                            // show this when the user has not selected an option
                            <div className={styler("vert-center")}>
                                {"<- Please choose the field you want to edit!"}
                            </div>
                        ) : (
                            // show the form when the user has selected an option
                            <>
                                <form className={styler("form")} onSubmit={handleSubmit}>
                                    <h1 className={`mb-5 ${styler("header2")}`}>Changing...</h1>
                                    {selection !== "password" ? (
                                        <div>
                                            <label className={styler("form-elem")}>{toTitleCase(selection)}</label>
                                            <input
                                                className={`mb-5 ${styler("inputField")}`}
                                                type="text"
                                                name={selection}
                                                onChange={handleChange}
                                                value={fields[selection]}
                                                required
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label className={styler("form-elem")}>Password</label>
                                                <input
                                                    className={`mb-5 ${styler("inputField")}`}
                                                    type="password"
                                                    name="password"
                                                    onChange={handleChange}
                                                    value={fields[selection]}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className={styler("form-elem")}>Confirm Password</label>
                                                <input
                                                    className={`mb-5 ${styler("inputField")}`}
                                                    type="password"
                                                    name="confirm_password"
                                                    onChange={handleChange}
                                                    value={fields["confirm_password"]}
                                                    required
                                                />
                                            </div>
                                        </>
                                    )}
                                    <input className={styler("submitButton")} type="submit" value="Submit" />
                                </form>
                                {/* render div iff message is not empty */}
                                {message !== "" && (
                                    <div className="mt-5">
                                        <span className={styler("error")}>
                                            {message}
                                            <button
                                                className={`ml-5 ${styler("errorClose")}`}
                                                title="Close"
                                                onClick={dismissMessage}
                                            >
                                                &times;
                                            </button>
                                        </span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Settings;
