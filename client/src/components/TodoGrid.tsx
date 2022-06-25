import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { filterTaskOptions } from "../functions/events";
import { BaseButton, IconButton } from "../styles";
import { ITask } from "../types";
import Task from "./Task";
import { todoModes } from "./Todo";
import TodoCreate from "./TodoCreate";
import TodoCycleModes from "./TodoCycleModes";
import TodoDropdown from "./TodoDropdown";
import TodoEdit from "./TodoEdit";

const Container = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    height: 85vh;
    justify-content: center;
    width: 90vw;
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

const ButtonTrash = styled(BaseButton)`
    background-color: rgb(255, 0, 90);
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

const TodoGrid = ({
    mode,
    cycleModes,
    taskCheck,
    checkedTasks,
    trashChecked,
    editingTask,
    setEditingTask,
    filteredTasks,
    filterOptions,
    setFilterOptions,
    handleSearch,
    hideModal,
}: {
    mode: todoModes;
    cycleModes: () => void;
    taskCheck: (id: string) => void;
    checkedTasks: Set<string>;
    trashChecked: () => void;
    editingTask: ITask | undefined;
    setEditingTask: React.Dispatch<React.SetStateAction<ITask | undefined>>;
    filteredTasks: ITask[];
    filterOptions: filterTaskOptions;
    setFilterOptions: React.Dispatch<React.SetStateAction<filterTaskOptions>>;
    handleSearch: React.ChangeEventHandler<HTMLInputElement>;
    hideModal: () => void;
}): JSX.Element => {
    const ddContentCSS: FlattenSimpleInterpolation = css`
        right: -4rem; // change this when adding more icons
        top: 2rem;
    `;

    const [createButton, createForm] = TodoCreate({
        containerWidth: 50,
    });

    return (
        <Container>
            {createForm}
            <ButtonClose onClick={hideModal}>&times;</ButtonClose>
            <Title>To-Do Grid</Title>
            <div className="w-full flex justify-center">
                <div className="relative w-2/4">
                    <SearchBox
                        type="text"
                        placeholder="Search..."
                        value={filterOptions.searchTerm}
                        onChange={handleSearch}
                    ></SearchBox>
                    {mode === "trash" && <ButtonTrash onClick={trashChecked}>Trash Selected</ButtonTrash>}
                    <IconsContainer>
                        {createButton}
                        <TodoCycleModes {...{ mode, cycleModes }} />
                        <TodoDropdown {...{ filterOptions, setFilterOptions, contentCSS: ddContentCSS }} />
                    </IconsContainer>
                </div>
            </div>
            <GridWrapper>
                {editingTask !== undefined && <TodoEdit {...{ width: 60, editingTask, setEditingTask }} />}
                {filteredTasks.length === 0 ? (
                    <div>Nothing here!</div>
                ) : (
                    <Grid>
                        {filteredTasks.map((task, i) => {
                            return (
                                <Task
                                    key={i}
                                    {...{
                                        task,
                                        mode,
                                        checked: checkedTasks.has(task.id),
                                        onCheck: taskCheck,
                                        setEditingTask: () => setEditingTask(task),
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
