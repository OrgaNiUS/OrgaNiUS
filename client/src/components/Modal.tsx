import React from "react";

import styled, { css } from "styled-components";

interface props {
    active: boolean;
}

const Outer = styled.div<props>`
    ${(props) =>
        props.active
            ? css`
                  background-color: rgba(128, 128, 128, 0.8);
                  transition: background-color 300ms linear;
                  z-index: 50;
              `
            : css`
                  visibility: hidden;
              `}
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    min-height: 100vh;
    position: fixed;
    text-align: center;
    top: 0;
    width: 100%;
`;

const Inner = styled.div<props>`
    ${(props) =>
        props.active
            ? css`
                  transform: translateY(0);
                  transition: transform 300ms linear;
              `
            : css`
                  transform: translateY(calc(-50vh));
              `}
    background-color: white;
    padding: 1.25rem;
    z-index: 51;
`;

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

    return (
        // onClick outer div to trigger close
        <Outer active={active} onClick={handleClick} data-testid="outer">
            <Inner active={active}>{body}</Inner>
        </Outer>
    );
};

export default Modal;
