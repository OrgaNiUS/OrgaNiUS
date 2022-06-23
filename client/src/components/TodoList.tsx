import {
    closestCenter,
    DndContext,
    DragEndEvent,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { filterTaskOptions } from "../functions/events";
import { Button } from "../styles";
import { ITask } from "../types";
import Task from "./Task";
import { todoModes } from "./Todo";
import TodoCreate from "./TodoCreate";
import TodoCycleModes from "./TodoCycleModes";
import TodoDropdown from "./TodoDropdown";
import TodoEdit from "./TodoEdit";
import TodoExpand from "./TodoExpand";

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

const ButtonTrash = styled(Button)`
    background-color: rgb(255, 0, 90);
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
const TodoList = ({
    mode,
    cycleModes,
    taskCheck,
    checkedTasks,
    trashChecked,
    editingTask,
    setEditingTask,
    filteredTasks,
    handleDragEnd,
    filterOptions,
    setFilterOptions,
    handleSearch,
    expandClick,
}: {
    mode: todoModes;
    cycleModes: () => void;
    taskCheck: (id: string) => void;
    checkedTasks: Set<string>;
    trashChecked: () => void;
    editingTask: ITask | undefined;
    setEditingTask: React.Dispatch<React.SetStateAction<ITask | undefined>>;
    filteredTasks: ITask[];
    handleDragEnd: (event: DragEndEvent) => void;
    filterOptions: filterTaskOptions;
    setFilterOptions: React.Dispatch<React.SetStateAction<filterTaskOptions>>;
    handleSearch: React.ChangeEventHandler<HTMLInputElement>;
    expandClick: () => void;
}): JSX.Element => {
    // drag 10 pixels before dragging actually starts
    const activationConstraint = { distance: 10 };
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint }),
        useSensor(TouchSensor, { activationConstraint })
    );

    const ddContentCSS: FlattenSimpleInterpolation = css`
        right: -10%;
        top: 2rem;
    `;

    const [createButton, createForm] = TodoCreate({
        containerWidth: 80,
    });

    return (
        <Wrapper>
            <Container>
                <Title>To-Do</Title>
                <SearchBox
                    type="text"
                    placeholder="Search..."
                    value={filterOptions.searchTerm}
                    onChange={handleSearch}
                />
                {mode === "trash" && <ButtonTrash onClick={trashChecked}>Trash Selected</ButtonTrash>}
                {filteredTasks.length === 0 ? (
                    <div>Nothing here!</div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        // restrictToVerticalAxis restricts to vertical dragging
                        // restrictToFirstScrollableAncestor restricts to scroll container
                        modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
                    >
                        <SortableContext
                            items={filteredTasks}
                            strategy={verticalListSortingStrategy}
                            // disable if not normal mode
                            disabled={mode !== "normal"}
                        >
                            {filteredTasks.map((task) => {
                                return (
                                    <Task
                                        key={task.id}
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
                        </SortableContext>
                    </DndContext>
                )}
            </Container>
            <IconsContainer>
                {createButton}
                <TodoCycleModes {...{ mode, cycleModes }} />
                <TodoDropdown {...{ filterOptions, setFilterOptions, contentCSS: ddContentCSS }} />
            </IconsContainer>
            {createForm}
            <TodoExpand {...{ onClick: expandClick }} />
            {editingTask !== undefined && <TodoEdit {...{ width: 80, editingTask, setEditingTask }} />}
        </Wrapper>
    );
};

export default TodoList;
