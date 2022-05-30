import React from "react";
import {Link} from "react-router-dom";

const PageDoesNotExist = (): JSX.Element => {
    return <div className="flex flex-col h-screen">
        <div className="flex fixed top-0 left-0 w-screen h-20 m-0 flex-row bg-blend-color shadow-lg ">
            <Link
                to="/"
                className="relative flex items-center justify-start content-start h-auto w-auto mt-2 mb-2 mx-auto text-4xl text-orange-500 antialiased hover:text-orange-600"
            >
                OrgaNiUS
            </Link>
        </div>
        <div className="flex grow mt-20 justify-center items-center text-3xl text-black font-bold">
            This Page does Not Exist
        </div>
    </div>;
}
export default PageDoesNotExist;