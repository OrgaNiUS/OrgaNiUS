import { useContext } from "react";
import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { IconButton } from "../../styles";
import Task from "./Task";
import { TodoView } from "./Todo";
import TodoCreate from "./TodoCreate";
import TodoDropdown from "./TodoDropdown";
import TodoEdit from "./TodoEdit";
import { TodoContext } from "./TodoProvider";

const Container = styled.div<{ custom: FlattenSimpleInterpolation }>`
    ${(props) => props.custom}
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

const Title = styled.h1`
    font-size: x-large;
    font-weight: bold;
`;

const SearchBox = styled.input`
    border: 1px solid black;
    margin: 1rem 2rem;
    padding: 0.5rem 1rem;
    width: 90%;
`;

const GridWrapper = styled.div`
    display: flex;
    justify-content: center;
    height: 70%;
`;

const Grid = styled.div`
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
    padding: 1rem;
    row-gap: 1rem;
    width: 80%;
    overflow-y: auto;
`;

const ButtonClose = styled(IconButton)`
    font-size: xx-large;
    position: absolute;
    right: 1rem;
    top: 0;
`;

const IconsContainer = styled.div`
    display: flex;
    position: absolute;
    right: -2rem; // increment this when adding more icons
    top: 1.3rem;
`;

const TodoGrid = ({ view }: { view: TodoView }): JSX.Element => {
    const props = useContext(TodoContext);

    const [createButton, createForm] = TodoCreate({ view });

    const containerCSS = {
        list: css``,
        grid: css`
            height: 85vh;
            width: 90vw;
        `,
        // TODO: enforce height otherwise weird scrolling?
        project: css`
            height: 100%;
        `,
    };

    return (
        <Container custom={containerCSS[view]}>
            {createForm}
            {props.isPersonal && <ButtonClose onClick={props.hideModal}>&times;</ButtonClose>}
            <Title>To-Do Grid</Title>
            <div className="w-full flex justify-center">
                <div className="relative w-2/4">
                    <SearchBox
                        type="text"
                        placeholder="Search..."
                        value={props.filterOptions.searchTerm}
                        onChange={props.handleSearch}
                    ></SearchBox>
                    <IconsContainer>
                        {createButton}
                        <TodoDropdown {...{ view }} />
                    </IconsContainer>
                </div>
            </div>
            <GridWrapper>
                {props.editingTask !== undefined && <TodoEdit {...{ view }} />}
                {props.filteredTasks.length === 0 ? (
                    <div>Nothing here!</div>
                ) : (
                    <Grid>
                        {props.filteredTasks.map((task, i) => {
                            return (
                                <Task
                                    key={i}
                                    {...{
                                        task,
                                        performDone: () => props.taskDone(task),
                                        performTrash: () => props.taskTrash(task),
                                        performEdit: () => props.taskEdit(task),
                                    }}
                                />
                            );
                        })}
                    </Grid>
                )}
            </GridWrapper>
        </Container>
    );
};

export default TodoGrid;
