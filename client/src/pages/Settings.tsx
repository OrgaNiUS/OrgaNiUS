import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { UserDelete, UserGetSelf, UserPatch } from "../api/UserAPI";
import Modal from "../components/Modal";
import { validEmail, validPassword, validUsername } from "../components/regex";
import AuthContext from "../context/AuthProvider";
import { toTitleCase } from "../functions/strings";
import { BaseButton } from "../styles";

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

// ensure these keys match the keys of interface Fields
// keyof Fields is there to prevent extra keys (but cannot prevent missing/duplicate keys, no other better yet simple solution)
// https://stackoverflow.com/questions/43909566/get-keys-of-a-typescript-interface-as-array-of-strings
const keys: (keyof Fields)[] = ["name", "email", "password"];

const centered = css`
    text-align: center;
    padding: 3rem;
`;

const Container = styled.div`
    align-items: center;
    justify-content: center;
    margin-left: 5rem;
    margin-right: 5rem;
    margin-top: 2.5rem;
`;

const Left = styled.div`
    border-right: 1px solid grey;
    float: left;
    width: 40%;

    ${centered}
`;

const Right = styled.div`
    float: right;
    width: 60%;

    ${centered}
`;

const VertCenter = styled.div`
    flex: auto;
    justify-content: center;
    align-items: center;
    height: 100;
`;

const H1 = styled.h1`
    font-size: xx-large;
    margin-bottom: 1rem;
`;

const H2 = styled.h2`
    font-size: x-large;
    margin-bottom: 1.25rem;
`;

const Form = styled.form`
    display: inline-block;
    vertical-align: center;
`;

const Label = styled.label`
    text-align: left;
    display: flex;
    flex-direction: column;
`;

const Input = styled.input`
    border: 1px solid grey;
    padding: 7px;
    color: grey;
`;

const ButtonChange = styled(BaseButton)`
    background-color: rgb(0, 85, 255);
`;

const ButtonDeleteAccount = styled(BaseButton)`
    background-color: rgb(255, 0, 90);
`;

const ButtonConfirmDelete = styled(ButtonDeleteAccount)`
    border: 1px solid rgb(255, 0, 90);
    float: right;
    margin-left: 0.75rem;
    margin-top: 1rem;
`;

const ButtonConfirmCancel = styled(BaseButton)`
    background-color: white;
    border: 1px solid black;
    color: black;
    float: right;
    margin-top: 1rem;
`;

const ButtonSubmit = styled(BaseButton)`
    background-color: rgb(255, 85, 0);
    float: right;
    margin: 0.6vh;
`;

const ErrorMessage = styled.span`
    background-color: red;
    border-radius: 6px;
    color: white;
    padding: 0.2rem 0.5rem;
`;

const ButtonErrorClose = styled.button`
    padding-left: 0.5rem;

    &:hover {
        color: black;
    }
`;

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
        UserGetSelf(
            auth.axiosInstance,
            (response) => {
                const data = response.data;
                setFields((f) => {
                    return { ...f, name: data["name"], email: data["email"] };
                });
            },
            (err) => {
                console.log(err.config);
                console.log(err);
            }
        );
    }, [auth.axiosInstance]);

    const handleClick = (key: keyof Fields) => {
        setSelection(key);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        setFields((f) => {
            return { ...f, [event.target.name]: event.target.value };
        });
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

        UserPatch(
            auth.axiosInstance,
            payload,
            (response) => {
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
            },
            (err) => {
                console.log(err);
            }
        );
    };

    const dismissMessage: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        setMessage("");
    };

    const handleConfirmDelete: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        UserDelete(
            auth.axiosInstance,
            (_) => {
                auth.setAuth({
                    user: undefined,
                    loggedIn: false,
                });
                navigate("/");
            },
            (err) => {
                console.log(err);
            }
        );
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
            <ButtonConfirmDelete onClick={handleConfirmDelete}>Confirm</ButtonConfirmDelete>
            <ButtonConfirmCancel onClick={() => setShowDeleteModal(false)}>Cancel</ButtonConfirmCancel>
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
            <Container>
                <Left>
                    <H1>Setings</H1>
                    {keys.map((key, i) => {
                        return (
                            <div key={i}>
                                <ButtonChange onClick={() => handleClick(key)}>
                                    {`Change ${toTitleCase(key)}`}
                                </ButtonChange>
                            </div>
                        );
                    })}
                    <ButtonDeleteAccount onClick={() => setShowDeleteModal(true)}>Delete Account</ButtonDeleteAccount>
                </Left>
                <Right>
                    {selection === undefined ? (
                        <VertCenter>{"<- Please choose the field you want to edit!"}</VertCenter>
                    ) : (
                        <>
                            <Form onSubmit={handleSubmit}>
                                <H2>Changing...</H2>
                                {selection !== "password" ? (
                                    <div>
                                        <Label>{toTitleCase(selection)}</Label>
                                        <Input
                                            type="text"
                                            name={selection}
                                            onChange={handleChange}
                                            value={fields[selection]}
                                            autoFocus
                                            required
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <Label>Password</Label>
                                            <Input
                                                type="password"
                                                name="password"
                                                onChange={handleChange}
                                                value={fields[selection]}
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Label>Confirm Password</Label>
                                            <Input
                                                type="password"
                                                name="confirm_password"
                                                onChange={handleChange}
                                                value={fields["confirm_password"]}
                                                required
                                            />
                                        </div>
                                    </>
                                )}
                                <ButtonSubmit type="submit">Submit</ButtonSubmit>
                            </Form>
                            {message !== "" && (
                                <div className="mt-5">
                                    <ErrorMessage>
                                        {message}
                                        <ButtonErrorClose title="Close" onClick={dismissMessage}>
                                            &times;
                                        </ButtonErrorClose>
                                    </ErrorMessage>
                                </div>
                            )}
                        </>
                    )}
                </Right>
            </Container>
        </>
    );
};

export default Settings;
