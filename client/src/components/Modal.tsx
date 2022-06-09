import React from "react";
import styles from "../styles/Modal.module.css";
import StylesMerger from "../styles/StyleMerging";

const styler = StylesMerger(styles);

// Flexible modal that can be used for various purposes.
// Callback function is called when the area outside the active modal is clicked, Intended to be used for closing the modal.
const Modal = ({
    active,
    body,
    callback,
}: {
    active: boolean;
    body: JSX.Element;
    callback: () => void;
}): JSX.Element => {
    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
        event.preventDefault();
        // https://stackoverflow.com/a/47155034
        // This check is done to prevent the inner div from triggering the callback function.
        if (event.target === event.currentTarget) {
            callback();
        }
    };

    // if (!active) {
    //     return (
    //         <div className={styler("inactive-outer", "outer")}>
    //             <div className={styler("inactive-inner", "inner")}>{body}</div>
    //         </div>
    //     );
    // }

    return (
        // onClick outer div to trigger close
        <div className={styler(active ? "active-outer" : "inactive-outer", "outer")} onClick={handleClick}>
            <div className={styler(active ? "active-inner" : "inactive-inner", "inner")}>{body}</div>
        </div>
    );
};

export default Modal;
