import React from "react";
import {useParams} from "react-router-dom";

const User = (): JSX.Element => {
    // gets parameters from path "http://{URL}/user/{username}"
    const {username} = useParams();
    return <div
        className="flex relative top-20 margin-top">
        Welcome, {username}!
    </div>;
};

export default User;
