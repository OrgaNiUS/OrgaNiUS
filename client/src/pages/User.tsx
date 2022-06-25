import React from "react";
import { useParams } from "react-router-dom";

const User = (): JSX.Element => {
    // gets parameters from path "http://{URL}/user/{username}"
    const { username } = useParams();
    return <div className="">Welcome, {username}!</div>;
};

export default User;
