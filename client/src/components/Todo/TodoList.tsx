import { useContext } from "react";
import styled from "styled-components";
import Task from "./Task";
import TodoCreate from "./TodoCreate";
import TodoDropdown from "./TodoDropdown";
import TodoEdit from "./TodoEdit";
import TodoExpand from "./TodoExpand";
import { TodoContext } from "./TodoProvider";

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

const SearchBox = styled.input`
    padding: 0.2rem 0.5rem;
    width: 100%;
`;

const IconsContainer = styled.div`
    display: flex;
    position: absolute;
    right: 2rem;
    top: 1.5rem;
`;

/**
 * Handles the Todo list.
 */
const TodoList = (): JSX.Element => {
    const props = useContext(TodoContext);

    const [createButton, createForm] = TodoCreate({ view: "list" });

    return (
        <Wrapper>
            <Container>
                <Title>To-Do</Title>
                <SearchBox
                    type="text"
                    placeholder="Search..."
                    value={props.filterOptions.searchTerm}
                    onChange={props.handleSearch}
                />
                {props.filteredTasks.length === 0 ? (
                    <div>Nothing here!</div>
                ) : (
                    <div>
                        {props.filteredTasks.map((task, i) => {
                            return <Task key={i} {...{ task }} />;
                        })}
                    </div>
                )}
            </Container>
            <IconsContainer>
                {createButton}
                <TodoDropdown {...{ view: "list" }} />
            </IconsContainer>
            {createForm}
            <TodoExpand {...{ onClick: props.showModal }} />
            {props.editingTask !== undefined && <TodoEdit {...{ view: "list" }} />}
        </Wrapper>
    );
};

export default TodoList;
