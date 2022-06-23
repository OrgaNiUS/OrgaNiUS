import styled, { css } from "styled-components";

// This file contains some styled components and css interpolation which are generic enough to be globally applied.

// recommended to change background-color as well
export const Button = styled.button`
    border-radius: 6px; /* border-radius for rounded button */
    color: white;
    margin: 0.25rem;
    padding: 0.1rem 0.5rem;

    &:hover {
        background-color: brightness(150%);
        box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    }
`;

// for buttons that are a SVG icon
export const IconButton = styled.button`
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.2);
    }
`;

// usable for text/password input, textarea
export const InputCSS = css`
    border: 1px solid grey;
    padding: 7px;
    color: grey;
`;

/* https://stackoverflow.com/a/26973672 */
export const truncate = css`
    overflow-x: hidden;
    text-overflow: ellipsis;
`;
