import React from 'react';
import {Link} from "react-router-dom";

const Navbar = (): JSX.Element => {
    return (
        <div className="navbar-wrapper">
            <Link to="/" className="home-icon">
                OrgaNiUS
            </Link>
            <Link to='/projects' className="navbar-icon">
                Projects
            </Link>
            <Link to='/users/Default' className="navbar-icon">
                User
            </Link>
            <Link to='/settings' className="navbar-icon">
                Settings
            </Link>
        </div>
    )
};

export default Navbar;