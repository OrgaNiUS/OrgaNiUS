import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import Timeline from "../components/Timeline";
import { todoModes } from "../components/Todo";
import TodoGrid from "../components/TodoGrid";
import { DataContext } from "../context/DataProvider";
import { filterTaskOptions, filterTasks } from "../functions/events";
import { IProject, ITask } from "../types";

const Title = styled.h1`
    font-size: 2rem;
`;

const ProjectContent = styled.p`
    margin-top: 1rem;
`;

const Container = styled.div`
    padding: 1rem 3rem;
    height: 100%;
    width: 100%;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    z-index: 2;
`;

const Box = styled.div`
    height: calc(100vh - 2 * (5rem + 1rem) - 5rem);
`;

const LeftBox = styled(Box)`
    width: 25%;
`;

const RightBox = styled(Box)`
    width: 75%;
    background-color: red;
    text-align: center;
`;

// TODO: make this work for project tasks (currently just pasted from personal tasks)
const Project = (): JSX.Element => {
    const data = useContext(DataContext);

    const { id } = useParams();
    const [project, setProject] = useState<IProject | undefined>(undefined);
    const [mode, setMode] = useState<todoModes>("normal");
    const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());
    const [editingTask, setEditingTask] = useState<ITask | undefined>(undefined);

    const cycleModes = () => {
        setCheckedTasks(new Set());
        setEditingTask(undefined);
        setMode((m) => {
            switch (m) {
                case "normal":
                    return "trash";
                case "trash":
                    return "edit";
                case "edit":
                    return "normal";
            }
        });
    };

    const taskCheck = (id: string) => {
        if (mode === "trash") {
            // mark as trash
            setCheckedTasks((t) => {
                const newSet = new Set(t);

                if (t.has(id)) {
                    newSet.delete(id);
                } else {
                    newSet.add(id);
                }

                return newSet;
            });
        }
        if (mode === "normal") {
            // mark as done
            const task = data.tasks.find((t) => t.id === id);
            if (task === undefined) {
                return;
            }
            data.patchTask({
                id,
                isDone: !task.isDone,
            });
        }
    };

    const trashChecked = () => {
        if (mode !== "trash") {
            // Should not happen.
            return;
        }
        const toBeTrashed: string[] = Array.from(checkedTasks);
        data.removeTasks(toBeTrashed);
        setCheckedTasks(new Set());
    };

    const [filterOptions, setFilterOptions] = useState<filterTaskOptions>({
        done: false,
        expired: false,
        personal: true,
        project: true,
        searchTerm: "",
    });
    const filteredTasks: ITask[] = filterTasks(data.tasks, filterOptions);

    const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        setFilterOptions((opts) => {
            return { ...opts, searchTerm: event.target.value };
        });
    };

    useEffect(() => {
        if (id === undefined) {
            return;
        }

        data.getProject(id).then((p) => {
            setProject(p);
        });

        // including data.getProject and id will cause this to continuously fire
        // eslint-disable-next-line
    }, []);

    if (project === undefined) {
        return (
            <Container>
                <Row className="my-2">
                    <Link to="/projects">⬅️ Back to Project</Link>
                </Row>
                <div>Loading... (or you have no permissions?)</div>
            </Container>
        );
    }

    return (
        <Container>
            <Row className="my-2">
                <Link to="/projects">⬅️ Back to Project</Link>
                <div>Button Array</div>
            </Row>
            <Row>
                <LeftBox>
                    <Title>{project.name}</Title>
                    <ProjectContent>{project.description}</ProjectContent>
                    <ProjectContent>Members: {project.members.map((m) => m.name).join(", ")}</ProjectContent>
                </LeftBox>
                <RightBox>
                    <TodoGrid
                        {...{
                            containerCSS: css``,
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
                            hideModal: undefined,
                        }}
                    />
                </RightBox>
            </Row>
            <div>
                {/* TODO: get events from event ids */}
                <Timeline {...{ events: [] }} />
            </div>
        </Container>
    );
};

export default Project;
