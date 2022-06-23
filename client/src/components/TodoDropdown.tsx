import styled, { FlattenSimpleInterpolation } from "styled-components";
import { filterTaskOptions } from "../functions/events";
import { IconButton } from "../styles";

const FDropdownContent = styled.div<{ custom: FlattenSimpleInterpolation }>`
    ${(props) => props.custom}
    background-color: white;
    border-radius: 6px;
    border: 1px solid black;
    padding: 0.2rem 0.4rem;
    position: absolute;
    transition: 0s visibility 0.3s;
    visibility: hidden;
    width: max-content;
    z-index: 1;
`;

const FDropdown = styled.div`
    &:hover ${FDropdownContent} {
        visibility: visible;
        transition: 0s visiblity 0s;
    }
`;

const ButtonFilter = styled(IconButton)``;

const TodoDropdown = ({
    filterOptions,
    setFilterOptions,
    contentCSS,
}: {
    filterOptions: filterTaskOptions;
    setFilterOptions: React.Dispatch<React.SetStateAction<filterTaskOptions>>;
    contentCSS: FlattenSimpleInterpolation;
}): JSX.Element => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();

        const key: "done" | "expired" = event.target.name as "done" | "expired";

        setFilterOptions((opts) => {
            return { ...opts, [key]: !opts[key] };
        });
    };

    return (
        <FDropdown>
            <ButtonFilter>
                {/* "filter" from https://heroicons.com/ */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                </svg>
            </ButtonFilter>
            <FDropdownContent custom={contentCSS}>
                <b>Filter Options</b>
                <div>
                    <input
                        /*
                            This key={Math.random()} was added as a response to a very bizarre React bug.
                            For some reason, when (almost) the exact same component is used in TodoGrid, the checkbox only wants to re-render every few clicks. However, it works without a problem in TodoList!!
                            Solution from https://stackoverflow.com/a/63126124
                            The solution is almost as weird as the problem. Using a random key forces the component to re-render.
                        */
                        key={Math.random()}
                        type="checkbox"
                        name={"done"}
                        checked={filterOptions.done}
                        onChange={handleChange}
                    />
                    <label className="ml-1">Done</label>
                </div>
                <div>
                    <input
                        key={Math.random()}
                        type="checkbox"
                        name={"expired"}
                        checked={filterOptions.expired}
                        onChange={handleChange}
                    />
                    <label className="ml-1">Expired</label>
                </div>
            </FDropdownContent>
        </FDropdown>
    );
};

export default TodoDropdown;
