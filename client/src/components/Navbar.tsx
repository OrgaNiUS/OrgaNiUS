import React, {useContext} from 'react';
import {Link, useNavigate} from "react-router-dom";
import axios from "../api/axios";
import AuthContext from "../context/AuthProvider";

const Navbar = (): JSX.Element => {

    const Auth = useContext(AuthContext)
    const navigate = useNavigate();
    const username = Auth.auth.user;
    const linkToUser: string = '/user/' + username;

    const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>)=> {
        axios.delete('/api/v1/logout')
            .then((success) => {
            Auth.setAuth({user: undefined, loggedIn: false})
                navigate('/')
        })
            .catch((err) => console.log(err))
    }

    return (
        <div className="navbar-wrapper">
            <Link to="/" className="home-icon">
                OrgaNiUS
            </Link>
            <Link to='/projects' className="navbar-icon">
                Projects
            </Link>
            <Link to={linkToUser} className="navbar-icon">
                User
            </Link>
            <Link to='/settings' className="navbar-icon">
                Settings
            </Link>
            <button onClick={handleLogout} className="relative flex items-center justify-center h-auto w-auto mt-2 mb-2 mx-auto font-semibold text-3xl text-red-500 antialiased hover:text-red-600">
                Logout
            </button>
        </div>
    )
};

export default Navbar;