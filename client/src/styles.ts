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

/* https://stackoverflow.com/a/26973672 */
export const truncate = css`
    overflow-x: hidden;
    text-overflow: ellipsis;
`;
