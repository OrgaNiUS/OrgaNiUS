import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled, { css } from "styled-components";
import { TaskGetAll } from "../api/TaskAPI";
import Timeline from "../components/Timeline";
import { todoModes } from "../components/Todo";
import TodoGrid from "../components/TodoGrid";
import AuthContext from "../context/AuthProvider";
import { DataContext } from "../context/DataProvider";
import { filterTaskOptions, filterTasks } from "../functions/events";
import { BaseButton } from "../styles";
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
    height: calc(100vh - 2 * (5rem + 1rem) - 6.5rem);
`;

const LeftBox = styled(Box)`
    width: 25%;
`;

const RightBox = styled(Box)`
    width: 75%;
    text-align: center;
`;

const ButtonArray = styled.div``;

const Button = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
`;

// TODO: make this work for project tasks (currently just pasted from personal tasks)
const Project = (): JSX.Element => {
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);

    const { id } = useParams();
    const [project, setProject] = useState<IProject | undefined>(undefined);
    const [tasks, setTasks] = useState<ITask[]>([]);
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
            const task: ITask | undefined = tasks.find((t) => t.id === id);
            if (task === undefined) {
                return;
            }
            data.patchTask({
                id,
                isDone: !task.isDone,
            });

            setTasks((t) => {
                const tasksCopy: ITask[] = [...t];
                for (let i = 0; i < tasksCopy.length; i++) {
                    const t: ITask = tasksCopy[i];
                    if (t.id !== task.id) {
                        continue;
                    }
                    t.isDone = !t.isDone;
                    tasksCopy[i] = t;
                    break;
                }
                return tasksCopy;
            });
        }
    };

    const trashChecked = () => {
        if (mode !== "trash") {
            // Should not happen.
            return;
        }
        if (id === undefined) {
            return;
        }

        const toBeTrashed: string[] = Array.from(checkedTasks);
        data.removeTasks(toBeTrashed, id);

        setTasks((t) => {
            const tasksCopy: ITask[] = t.filter((t) => !toBeTrashed.includes(t.id));

            for (let i = 0; i < tasksCopy.length; i++) {
                tasksCopy[i].id = i.toString();
            }
            return tasksCopy;
        });
        setCheckedTasks(new Set());
    };

    const [filterOptions, setFilterOptions] = useState<filterTaskOptions>({
        done: false,
        expired: false,
        personal: false,
        project: true,
        taskids: project?.tasks,
        searchTerm: "",
    });
    const filteredTasks: ITask[] = filterTasks(tasks, filterOptions);

    const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        setFilterOptions((opts) => {
            return { ...opts, searchTerm: event.target.value };
        });
    };

    const createCallback = (task: ITask | undefined) => {
        if (task === undefined) {
            return;
        }
        setTasks((t) => {
            return [...t, task];
        });
    };

    const editCallback = (task: ITask | undefined) => {
        if (task === undefined) {
            return;
        }
        setTasks((t) => {
            const tasksCopy: ITask[] = [...t];
            for (let i = 0; i < tasksCopy.length; i++) {
                const t: ITask = tasksCopy[i];
                if (t.id !== task.id) {
                    continue;
                }
                Object.entries(task).forEach(([k, v]) => {
                    const key = k as keyof ITask;
                    // not fully typed but Partial<ITask> ensures types will match
                    (t[key] as any) = v;
                });
                tasksCopy[i] = t;
                break;
            }
            return tasksCopy;
        });
    };

    useEffect(() => {
        if (id === undefined) {
            return;
        }

        data.getProject(id).then((p) => {
            setProject(p);
        });

        TaskGetAll(
            auth.axiosInstance,
            { projectid: id },
            (response) => {
                const data = response.data;
                const tasks: ITask[] = data.tasks.map((task: any) => {
                    // if 0 seconds since epoch time, treat as no deadline
                    const deadline: Date | undefined =
                        task.deadline === "1970-01-01T00:00:00Z" ? undefined : new Date(task.deadline);
                    return { ...task, creationTime: new Date(task.creationTime), deadline };
                });

                setTasks(tasks);
            },
            () => {}
        );

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
                <ButtonArray>
                    {/* TODO: in future */}
                    <Button disabled>Settings</Button>
                    <Button disabled>Invite</Button>
                </ButtonArray>
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
                            isPersonal: false,
                            projectid: project.id,
                            createCallback,
                            editCallback,
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
