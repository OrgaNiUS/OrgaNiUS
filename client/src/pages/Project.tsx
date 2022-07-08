import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import PreLoader from "../components/PreLoader";
import Timeline from "../components/Timeline";
import TodoGrid from "../components/Todo/TodoGrid";
import { TodoProvider } from "../components/Todo/TodoProvider";
import { DataContext } from "../context/DataProvider";
import { filterTaskOptions, mergeEventArrays } from "../functions/events";
import { BaseButton } from "../styles";
import { IEvent, IProject, ITask } from "../types";

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
    height: calc(100vh - 15.5rem); /* magic number that works well */
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

const Project = (): JSX.Element => {
    const data = useContext(DataContext);

    const { id: projectid } = useParams();
    const [loading, setLoading] = useState<boolean>(true);
    const [project, setProject] = useState<IProject | undefined>(undefined);
    const [tasks, setTasks] = useState<ITask[]>([]);

    const doneTrigger = (task: ITask) => {
        data.patchTask(
            {
                id: task.id,
                isDone: !task.isDone,
            },
            task
        );

        setTasks((t) => {
            const tasksCopy: ITask[] = [...t];
            for (let i = 0; i < tasksCopy.length; i++) {
                const t: ITask = { ...tasksCopy[i] };
                if (t.id !== task.id) {
                    continue;
                }
                t.isDone = !t.isDone;
                tasksCopy[i] = t;
                break;
            }
            return tasksCopy;
        });
    };

    const trashTrigger = (task: ITask) => {
        if (projectid === undefined) {
            return;
        }

        const id: string = task.id;
        const toBeTrashed: string[] = [id];
        data.removeTasks(toBeTrashed, projectid);

        setTasks((t) => {
            const tasksCopy: ITask[] = t.filter((t) => !toBeTrashed.includes(t.id));

            return tasksCopy;
        });
    };

    const filterOptions: filterTaskOptions = {
        done: false,
        expired: false,
        personal: false,
        project: true,
        searchTerm: "",
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
                const t: ITask = { ...tasksCopy[i] };
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

    // TODO: get events from event ids
    const mergedEvents: IEvent[] = mergeEventArrays([], tasks);

    useEffect(() => {
        if (projectid === undefined) {
            return;
        }

        data.getProject(projectid).then(([project, tasks]) => {
            setProject(project);
            setTasks(tasks);
            setLoading(false);
        });

        // including data.getProject and id will cause this to continuously fire
        // eslint-disable-next-line
    }, []);

    if (project === undefined) {
        return (
            <Container>
                <Row className="my-2">
                    <Link to="/projects">⬅️ Back to Projects</Link>
                </Row>
                <PreLoader {...{ loading }} />
            </Container>
        );
    }

    return (
        <TodoProvider
            {...{
                projectid: projectid ?? "",
                tasks,
                defaultFilterOptions: filterOptions,
                setIsModalShown: undefined,
                doneTrigger,
                trashTrigger,
                createCallback,
                editCallback,
                members: project.members,
            }}
        >
            <Container>
                <Row className="my-2">
                    <Link to="/projects">⬅️ Back to Projects</Link>
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
                        <TodoGrid {...{ view: "project" }} />
                    </RightBox>
                </Row>
                <div className="h-4">
                    <Timeline {...{ events: mergedEvents }} />
                </div>
            </Container>
        </TodoProvider>
    );
};

export default Project;
