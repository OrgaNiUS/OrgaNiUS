import { useState } from "react";
import styled from "styled-components";
import { filterTaskOptions, filterTasks } from "../functions/events";
import { ITask } from "../types";
import Modal from "./Modal";
import Task from "./Task";

const FDropdownContent = styled.div`
    background-color: white;
    border-radius: 6px;
    border: 1px solid black;
    position: absolute;
    right: -20%;
    top: 3rem;
    transition: 0s visibility 0.3s;
    visibility: hidden;
    padding: 0.2rem 0.4rem;
    z-index: 1;
`;

const FDropdown = styled.div`
    &:hover ${FDropdownContent} {
        visibility: visible;
        transition: 0s visiblity 0s;
    }
`;

const Dropdown = ({
    filterOptions,
    setFilterOptions,
}: {
    filterOptions: filterTaskOptions;
    setFilterOptions: React.Dispatch<React.SetStateAction<filterTaskOptions>>;
}): JSX.Element => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const key: string = event.target.name;
        const value: boolean = event.target.checked;

        setFilterOptions((opts) => {
            return { ...opts, [key]: value };
        });
    };

    return (
        <FDropdownContent>
            <b>Filter Options</b>
            <div>
                <input type="checkbox" name={"done"} checked={filterOptions.done} onChange={handleChange} />
                <label className="ml-1">Done</label>
            </div>
            <div>
                <input type="checkbox" name={"expired"} checked={filterOptions.expired} onChange={handleChange} />
                <label className="ml-1">Expired</label>
            </div>
        </FDropdownContent>
    );
};

// TODO: Todo Modal View
const TodoModal: JSX.Element = <div>I am the Todo expanded view.</div>;

const Wrapper = styled.div`
    position: relative;
`;

const Container = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    /* 5rem from navbar, 3rem from welcome message */
    height: calc(100vh - 2 * (5rem + 1rem));
    overflow-y: auto;
    padding: 1rem;
`;

const Title = styled.h1`
    font-size: x-large;
    font-weight: bold;
    text-align: center;
`;

const Button = styled.button`
    position: absolute;
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.2);
    }
`;

const ButtonFilter = styled(Button)`
    right: 1rem;
    top: 1rem;
`;

const ButtonExpand = styled(Button)`
    bottom: 1rem;
    right: 1rem;
`;

const SearchBox = styled.input`
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    width: 100%;
`;

const Todo = ({ tasks }: { tasks: ITask[] }): JSX.Element => {
    const [filterOptions, setFilterOptions] = useState<filterTaskOptions>({
        done: false,
        expired: false,
        searchTerm: "",
    });
    const [showModal, setShowModal] = useState<boolean>(false);

    const filteredTasks: ITask[] = filterTasks(tasks, filterOptions);

    const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        setFilterOptions((opts) => {
            return { ...opts, searchTerm: event.target.value };
        });
    };

    return (
        <>
            <Modal {...{ active: showModal, body: TodoModal, callback: () => setShowModal(false) }} />
            <Wrapper>
                <Container>
                    <Title>To-Do</Title>
                    <SearchBox
                        type="text"
                        placeholder="Search..."
                        value={filterOptions.searchTerm}
                        onChange={handleSearch}
                    />
                    {filteredTasks.length === 0 ? (
                        <div>Nothing here!</div>
                    ) : (
                        filteredTasks.map((task, i) => {
                            return <Task key={i} {...{ task }} />;
                        })
                    )}
                </Container>
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
                    <Dropdown {...{ filterOptions, setFilterOptions }} />
                </FDropdown>
                <ButtonExpand>
                    {/* "arrows-expand" from https://heroicons.com/ */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        onClick={() => setShowModal(true)}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                    </svg>
                </ButtonExpand>
            </Wrapper>
        </>
    );
};

export default Todo;
