import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { ProjectDelete, ProjectLeave, ProjectModify, ProjectRemoveUser } from "../api/ProjectAPI";
import Modal from "../components/Modal";
import PreLoader from "../components/PreLoader";
import ProjectsInvite from "../components/Projects/ProjectsInvite";
import Timeline from "../components/Timeline";
import TodoGrid from "../components/Todo/TodoGrid";
import { TodoProvider } from "../components/Todo/TodoProvider";
import AuthContext from "../context/AuthProvider";
import { DataContext } from "../context/DataProvider";
import { filterTaskOptions, mergeEventArrays } from "../functions/events";
import { BaseButton, NoEffectButton } from "../styles";
import { IEvent, IProject, ITask, IUser } from "../types";
import { removeFromArray } from "../functions/arrays";

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

const Button2 = styled(Button)`
    width: 45%;
`;

const ButtonDeleteProject = styled(BaseButton)`
    background-color: rgb(255, 0, 90);
    width: 45%;
`;

const ButtonLeaveProject = styled(BaseButton)`
    background-color: rgb(255, 0, 90);
`;

const ButtonConfirmDelete = styled(BaseButton)`
    background-color: rgb(255, 0, 90);
    border: 1px solid rgb(255, 0, 90);
    float: centre;
    margin-left: 0.75rem;
    margin-top: 1rem;
`;

const ButtonConfirmCancel = styled(BaseButton)`
    background-color: white;
    border: 1px solid black;
    color: black;
    float: centre;
    margin-top: 1rem;
    margin-left: 0.75rem;
`;

const Project = (): JSX.Element => {
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);
    const navigate = useNavigate();

    const { id: projectid } = useParams();
    const [loading, setLoading] = useState<boolean>(true);
    const [project, setProject] = useState<IProject | undefined>(undefined);
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [showInviteWindow, setShowInviteWindow] = useState<boolean>(false);
    const isAdmin: boolean = project?.members.find((u) => u.name === auth.auth.user)?.role === "admin";
    const [newName, setNewName] = useState<string>();
    const [newDesc, setNewDesc] = useState<string>();
    const [isPublic, setPublic] = useState<boolean>();
    const [currUsers, setCurrUsers] = useState<Array<IUser>>([]);
    const [removedUsers, setRemovedUsers] = useState<Array<IUser>>([]);

    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showRemModal, setShowRemModal] = useState<boolean>(false);
    const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

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

        // Debugging purposes
        // setProject({
        //     id: "5215321",
        //     name: "Trial Project",
        //     description: "testsfasfasafsa description",
        //     members: [
        //         { id: "123111", name: "USER1", role: "admin" },
        //         { id: "123222", name: "USER2", role: "member" },
        //         { id: "123333", name: "USER3", role: "member" },
        //     ],
        //     events: [],
        //     tasks: [],
        //     creationTime: new Date(),
        //     isPublic: false,
        // });
        // setLoading(false);
        // including data.getProject and id will cause this to continuously fire
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        if (project) {
            setCurrUsers(project.members.filter((user) => user.id !== auth.auth.id));
            setPublic(project.isPublic);
        }
    }, [project]);

    if (project === undefined || projectid === undefined) {
        return (
            <Container>
                <Row className="my-2">
                    <Link to="/projects">⬅️ Back to Projects</Link>
                </Row>
                <PreLoader {...{ loading }} />
            </Container>
        );
    }

    const handleChangeName: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        ProjectModify(
            auth.axiosInstance,
            { name: newName, projectid: projectid },
            () => {
                project.name = newName ?? project.name;
            },
            () => {
                setNewName(undefined);
            }
        );
    };

    const handleChangeDesc: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        ProjectModify(
            auth.axiosInstance,
            { description: newDesc, projectid: projectid },
            () => {
                project.description = newDesc ?? project.description;
            },
            () => {
                setNewDesc(undefined);
            }
        );
    };

    const handleChangePublic: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        ProjectModify(
            auth.axiosInstance,
            { isPublic: !isPublic, projectid: projectid },
            () => {
                setPublic(!isPublic);
            },
            () => {}
        );
    };

    const handleDelete: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        ProjectDelete(
            auth.axiosInstance,
            { projectid: projectid },
            () => {
                navigate("/projects");
                window.location.reload();
            },
            () => {}
        );
    };

    const handleRemoveUsers: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        ProjectRemoveUser(
            auth.axiosInstance,
            { projectid: projectid, userids: removedUsers.map((user) => user.id) },
            () => {
                setShowRemModal(false);
                setShowSettingsModal(true);
                window.location.reload();
            },
            () => {
                setShowRemModal(false);
                setShowSettingsModal(true);
            }
        );
    };

    const handleLeaveProject: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        ProjectLeave(
            auth.axiosInstance,
            { projectid: projectid },
            () => {
                navigate("/projects");
                window.location.reload();
            },
            () => {}
        );
    };

    const SettingsModal = (
        <>
            <h1 className="mb-1 text-2xl underline underline-offset-auto">Project Settings</h1>

            <div className="w-full flex-col">
                <div className="flex w-full justify-start">
                    <input
                        className="w-80 border-2 border-gray-200 rounded"
                        type="text"
                        placeholder="New Project Name"
                        onChange={(e) => setNewName(e.target.value)}
                    ></input>
                    <Button type="submit" onClick={handleChangeName}>
                        Change
                    </Button>
                </div>
                <div className="flex-col w-full">
                    <input
                        className="w-80 border-2 border-gray-200 rounded"
                        type="text"
                        placeholder="New Description"
                        onChange={(e) => setNewDesc(e.target.value)}
                    ></input>
                    <Button type="submit" onClick={handleChangeDesc}>
                        Change
                    </Button>
                </div>
                <div className="mt-2">
                    <Button2
                        onClick={() => {
                            setShowRemModal(true);
                            setShowSettingsModal(false);
                        }}
                    >
                        Edit Users
                    </Button2>
                    <Button2>
                        <Link to={`/project_applications/${projectid}`}>User Join Requests</Link>
                    </Button2>
                </div>
                <div className="mt-2">
                    {isPublic ? (
                        <Button2 type="submit" onClick={handleChangePublic}>
                            Make Private
                        </Button2>
                    ) : (
                        <Button2 type="submit" onClick={handleChangePublic}>
                            Make Public
                        </Button2>
                    )}
                    <ButtonDeleteProject
                        onClick={() => {
                            setShowDeleteModal(true);
                            setShowSettingsModal(false);
                        }}
                    >
                        Delete Project
                    </ButtonDeleteProject>
                </div>
            </div>
        </>
    );

    const RemoveUsersModal = (
        <>
            <h1 className="mb-1 text-2xl underline underline-offset-auto">Edit Users</h1>
            <div className="w-full flex-col" key={currUsers.length}>
                <div className="w-full ">
                    Current Users:
                    <div className="w-80">
                        {currUsers.map((User) => {
                            return (
                                <>
                                    <li className="flex flex-row mt-1 border-2 items-center rounded" key={User.id}>
                                        <div className="flex justify-items-start flex-grow">{User.name}</div>
                                        <Button
                                            className="flex justify-end"
                                            onClick={() => {
                                                let tempRemovedUsers = removedUsers;
                                                tempRemovedUsers.push(User);
                                                setRemovedUsers(tempRemovedUsers);
                                                let tempCurrUsers = currUsers;
                                                tempCurrUsers = removeFromArray(tempCurrUsers, User);
                                                setCurrUsers(tempCurrUsers);
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </li>
                                </>
                            );
                        })}
                    </div>
                </div>
                <div className="w-full flex-col">
                    Users to be Removed:
                    <div className="w-80">
                        {removedUsers.map((User) => {
                            return (
                                <>
                                    <li className="flex flex-row mt-1 border-2 items-center rounded" key={User.id}>
                                        <div className="flex justify-items-start flex-grow">{User.name}</div>
                                        <Button
                                            onClick={() => {
                                                let tempRemovedUsers = removedUsers;
                                                let tempCurrUsers = currUsers;
                                                tempCurrUsers.push(User);
                                                setCurrUsers(tempCurrUsers);
                                                tempRemovedUsers = removeFromArray(tempRemovedUsers, User);
                                                setRemovedUsers(tempRemovedUsers);
                                            }}
                                        >
                                            Don't Remove
                                        </Button>
                                    </li>
                                </>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-2">
                    <Button2
                        onClick={() => {
                            setShowRemModal(false);
                            setShowSettingsModal(true);
                            setCurrUsers(project.members.filter((user) => user.id !== auth.auth.id));
                            setRemovedUsers([]);
                        }}
                    >
                        Cancel
                    </Button2>
                    <Button2 onClick={handleRemoveUsers}>Confirm</Button2>
                </div>
            </div>
        </>
    );

    const DeleteModal = (
        <>
            <div>
                <svg
                    // SVG from https://heroicons.com/
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-8 pr-2 align-bottom inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                Are you sure you want to delete this account?
            </div>
            <div>This is irreversible.</div>
            <ButtonConfirmDelete onClick={handleDelete}>Confirm</ButtonConfirmDelete>
            <ButtonConfirmCancel
                onClick={() => {
                    setShowDeleteModal(false);
                    setShowSettingsModal(true);
                }}
            >
                Cancel
            </ButtonConfirmCancel>
        </>
    );

    const LeaveModal = (
        <>
            <div>
                <svg
                    // SVG from https://heroicons.com/
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-8 pr-2 align-bottom inline"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                </svg>
                Are you sure you want to leave this project?
            </div>
            <div>You will need to apply/get invited to join the project again.</div>
            <ButtonConfirmDelete onClick={handleLeaveProject}>Confirm</ButtonConfirmDelete>
            <ButtonConfirmCancel
                onClick={() => {
                    setShowLeaveModal(false);
                }}
            >
                Cancel
            </ButtonConfirmCancel>
        </>
    );

    return (
        <TodoProvider
            {...{
                projectid,
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
            <>
                <Modal
                    {...{
                        active: showDeleteModal,
                        body: DeleteModal,
                        callback: () => {
                            setShowDeleteModal(false);
                        },
                    }}
                />
                <Modal
                    {...{
                        active: showSettingsModal,
                        body: SettingsModal,
                        callback: () => {
                            setShowSettingsModal(false);
                        },
                    }}
                />
                <Modal
                    {...{
                        active: showRemModal,
                        body: RemoveUsersModal,
                        callback: () => {
                            setShowRemModal(false);
                            setCurrUsers(project.members.filter((user) => user.id !== auth.auth.id));
                            setRemovedUsers([]);
                        },
                    }}
                />
                <Modal
                    {...{
                        active: showLeaveModal,
                        body: LeaveModal,
                        callback: () => {
                            setShowLeaveModal(false);
                        },
                    }}
                />
                <Container>
                    {showInviteWindow && <ProjectsInvite {...{ projectid, setShowInviteWindow }} />}
                    <Row className="my-2">
                        <Link to="/projects">⬅️ Back to Projects</Link>
                        <ButtonArray className="border-2 rounded border-orange-300 bg-orange-200">
                            {isAdmin ? (
                                <Button onClick={() => setShowSettingsModal(true)}>Settings</Button>
                            ) : (
                                <NoEffectButton disabled className="bg-slate-400">
                                    Settings
                                </NoEffectButton>
                            )}
                            <Button onClick={() => setShowInviteWindow(true)} disabled={!isAdmin}>
                                Invite
                            </Button>
                            <ButtonLeaveProject onClick={() => {
                                setShowLeaveModal(true);
                            }}>Leave Project</ButtonLeaveProject>
                        </ButtonArray>
                    </Row>
                    <Row>
                        <LeftBox>
                            <Title className="underline underline-offset-auto">{project.name}</Title>
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
            </>
        </TodoProvider>
    );
};

export default Project;
