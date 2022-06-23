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
import { ITask } from "../types";
import Task from "./Task";
import TodoCreate from "./TodoCreate";
import TodoDropdown from "./TodoDropdown";
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

/**
 * Handles the Todo list.
 */
const TodoList = ({
    filteredTasks,
    handleDragEnd,
    filterOptions,
    setFilterOptions,
    handleSearch,
    expandClick,
}: {
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
        top: 3rem;
    `;

    const ddIconCSS: FlattenSimpleInterpolation = css`
        right: 3rem;
        top: 1rem;
    `;

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
                        <SortableContext items={filteredTasks} strategy={verticalListSortingStrategy}>
                            {filteredTasks.map((task) => {
                                return <Task key={task.id} {...{ task }} />;
                            })}
                        </SortableContext>
                    </DndContext>
                )}
            </Container>
            <TodoDropdown {...{ filterOptions, setFilterOptions, contentCSS: ddContentCSS, iconCSS: ddIconCSS }} />
            <TodoCreate
                {...{
                    containerWidth: 80,
                    iconCSS: css`
                        top: 1rem;
                        right: 1rem;
                    `,
                }}
            />
            <TodoExpand {...{ onClick: expandClick }} />
        </Wrapper>
    );
};

export default TodoList;
