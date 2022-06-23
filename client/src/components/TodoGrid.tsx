import {
    DndContext,
    DragEndEvent,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    closestCenter,
} from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { filterTaskOptions } from "../functions/events";
import { IconButton } from "../styles";
import { ITask } from "../types";
import Task from "./Task";
import TodoCreate from "./TodoCreate";
import TodoDropdown from "./TodoDropdown";

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

const ButtonClose = styled(IconButton)`
    top: 0;
    right: 1rem;
    font-size: xx-large;
`;

const TodoGrid = ({
    filteredTasks,
    handleDragEnd,
    filterOptions,
    setFilterOptions,
    handleSearch,
    hideModal,
}: {
    filteredTasks: ITask[];
    handleDragEnd: (event: DragEndEvent) => void;
    filterOptions: filterTaskOptions;
    setFilterOptions: React.Dispatch<React.SetStateAction<filterTaskOptions>>;
    handleSearch: React.ChangeEventHandler<HTMLInputElement>;
    hideModal: () => void;
}): JSX.Element => {
    // drag 10 pixels before dragging actually starts
    const activationConstraint = { distance: 20 };
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint }),
        useSensor(TouchSensor, { activationConstraint })
    );

    const ddContentCSS: FlattenSimpleInterpolation = css`
        right: -6rem;
        top: 4rem;
    `;

    const ddIconCSS: FlattenSimpleInterpolation = css`
        right: 0;
        top: 1.5rem;
    `;

    return (
        <Container>
            <TodoCreate
                {...{
                    containerWidth: 50,
                    // this css is a bit hacky but seems to work well with most resolutions (potentially use calc() to get better estimates?)
                    iconCSS: css`
                        top: 15.6%;
                        right: 22.5%;
                    `,
                }}
            />
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
                    <TodoDropdown
                        {...{ filterOptions, setFilterOptions, contentCSS: ddContentCSS, iconCSS: ddIconCSS }}
                    />
                </div>
            </div>
            <GridWrapper>
                {filteredTasks.length === 0 ? (
                    <div>Nothing here!</div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        autoScroll
                    >
                        <SortableContext items={filteredTasks} strategy={rectSortingStrategy}>
                            <Grid>
                                {filteredTasks.map((task) => {
                                    return <Task key={task.id} {...{ task }} />;
                                })}
                            </Grid>
                        </SortableContext>
                    </DndContext>
                )}
            </GridWrapper>
        </Container>
    );
};

export default TodoGrid;
