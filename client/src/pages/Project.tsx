import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import { ProjectDelete, ProjectLeave, ProjectModify, ProjectRemoveUser } from "../api/ProjectAPI";
import Modal from "../components/Modal";
import AltModal from "../components/AltModal";
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
    const [newName, setNewName] = useState<string>();
    const [newDesc, setNewDesc] = useState<string>();
    const [isPublic, setPublic] = useState<boolean>();
    const [currUsers, setCurrUsers] = useState<Array<IUser>>([]);
    const [removedUsers, setRemovedUsers] = useState<Array<IUser>>([]);

    const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [showRemModal, setShowRemModal] = useState<boolean>(false);
    const [showLeaveModal, setShowLeaveModal] = useState<boolean>(false);

    type states = "empty" | "loading" | "success" | "error";
    const [state, setState] = useState<states>("empty");

    const isAdmin: boolean = project?.members.find((u) => u.name === auth.auth.user)?.role === "admin";

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

    useEffect(() => {
        if (project) {
            setCurrUsers(project.members.filter((user) => user.id !== auth.auth.id));
            setPublic(project.isPublic);
            setNewName(project.name);
            setNewDesc(project.description);
        }
    }, [project, auth.auth]);

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
        setState("loading");
        ProjectModify(
            auth.axiosInstance,
            { name: newName, projectid: projectid },
            () => {
                project.name = newName ?? project.name;
                setState("success");
            },
            () => {
                setState("error");
            }
        );
    };

    const handleChangeDesc: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        setState("loading");
        ProjectModify(
            auth.axiosInstance,
            { description: newDesc, projectid: projectid },
            () => {
                project.description = newDesc ?? project.description;
                setState("success");
            },
            () => {
                setState("error");
            }
        );
    };

    const handleChangePublic: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();
        setState("loading");
        ProjectModify(
            auth.axiosInstance,
            { isPublic: !isPublic, projectid: projectid },
            () => {
                setPublic(!isPublic);
                setState("success");
            },
            () => {
                setState("error");
            }
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
            () => {
                setState("error");
            }
        );
    };

    const handleRemoveUsers: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        setState("loading");
        ProjectRemoveUser(
            auth.axiosInstance,
            { projectid: projectid, userids: removedUsers.map((user) => user.id) },
            () => {
                setShowRemModal(false);
                setShowSettingsModal(true);
                setState("success");
                window.location.reload();
            },
            () => {
                setShowRemModal(false);
                setShowSettingsModal(true);
                setState("error");
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

    const userSort = (a: IUser, b: IUser): number => {
        return a.name > b.name ? 1 : a.name < b.name ? -1 : 0;
    };

    const updateStatusSwitch = {
        empty: <></>,
        error: (
            <h1 className="text-left w-full italic text-red-800 font-semibold">
                Error: Update failed, please try again.
            </h1>
        ),
        loading: (
            <h1 className="text-left w-full text-blue-800 font-medium italic rounded-lg inline-flex items-center">
                <svg
                    role="status"
                    className="inline mr-3 w-3.5 h-3.5 animate-spin"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="#E5E7EB"
                    />
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentColor"
                    />
                </svg>
                <span className="inline">Updating Project...</span>
            </h1>
        ),
        success: <h1 className="text-left w-full italic text-green-800 font-semibold">Project updated successfully</h1>,
    };

    const SettingsModal = (
        <>
            <h1 className="mb-1 text-2xl underline underline-offset-auto text-left font-semibold">Project Settings</h1>
        
            {updateStatusSwitch[state]}

            <div className="w-full flex-col mt-1">
                <div className="flex w-full justify-start">
                    <input
                        className="w-80 border-2 border-gray-300 rounded indent-1 text-slate-400 hover:border-gray-400 focus:text-black"
                        type="text"
                        placeholder="New Project Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    ></input>
                    <Button
                        type="submit"
                        disabled={state === "loading"}
                        className="disabled:bg-slate-500 disabled:hover:shadow-none"
                        onClick={handleChangeName}
                    >
                        Change
                    </Button>
                </div>
                <div className="flex w-full justify-start mt-2">
                    <input
                        className="w-80 border-2 border-gray-300 rounded indent-1 text-slate-400 hover:border-gray-400 focus:text-black"
                        type="text"
                        placeholder="New Description"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                    ></input>
                    <Button
                        type="submit"
                        disabled={state === "loading"}
                        className="disabled:bg-slate-500 disabled:hover:shadow-none"
                        onClick={handleChangeDesc}
                    >
                        Change
                    </Button>
                </div>
                <div className="mt-2">
                    <Button2
                        onClick={() => {
                            setShowRemModal(true);
                            setShowSettingsModal(false);
                        }}
                        disabled={state === "loading"}
                        className="disabled:bg-slate-500 disabled:hover:shadow-none"
                    >
                        Edit Users
                    </Button2>
                    <Button2
                        disabled={state === "loading"}
                        className="disabled:bg-slate-500 disabled:hover:shadow-none"
                    >
                        <Link to={`/project_applications/${projectid}`}>User Join Requests</Link>
                    </Button2>
                </div>
                <div className="mt-2">
                    {isPublic ? (
                        <Button2
                            type="submit"
                            disabled={state === "loading"}
                            className="disabled:bg-slate-500 disabled:hover:shadow-none"
                            onClick={handleChangePublic}
                        >
                            Make Private
                        </Button2>
                    ) : (
                        <Button2
                            type="submit"
                            disabled={state === "loading"}
                            className="disabled:bg-slate-500 disabled:hover:shadow-none"
                            onClick={handleChangePublic}
                        >
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
            <h1 className="mb-1 text-2xl underline underline-offset-auto font-semibold">Edit Users</h1>
            <div className="w-full flex-col" key={currUsers.length}>
                <div className="w-full text-left font-medium">
                    Current Users:
                    <div className="w-80 font-normal indent-2">
                        {currUsers.map((User) => {
                            return (
                                <>
                                    <li
                                        className="flex flex-row mt-1 border-2 border-green-500 items-center rounded"
                                        key={User.id}
                                    >
                                        <div className="flex justify-items-start flex-grow">{User.name}</div>
                                        <Button
                                            className="flex justify-end"
                                            onClick={() => {
                                                let tempRemovedUsers = [...removedUsers];
                                                let tempCurrUsers = [...currUsers];
                                                tempRemovedUsers.push(User);
                                                tempCurrUsers = removeFromArray(tempCurrUsers, User);
                                                tempRemovedUsers.sort(userSort);
                                                tempCurrUsers.sort(userSort);
                                                setRemovedUsers(tempRemovedUsers);
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
                <div className="w-full flex-col text-left font-medium">
                    Users to be Removed:
                    <div className="w-80 font-normal indent-2">
                        {removedUsers.map((User) => {
                            return (
                                <>
                                    <li
                                        className="flex flex-row mt-1 border-2 border-red-500 items-center rounded"
                                        key={User.id}
                                    >
                                        <div className="flex justify-items-start flex-grow">{User.name}</div>
                                        <Button
                                            onClick={() => {
                                                let tempRemovedUsers = [...removedUsers];
                                                let tempCurrUsers = [...currUsers];
                                                tempCurrUsers.push(User);
                                                tempRemovedUsers = removeFromArray(tempRemovedUsers, User);
                                                tempRemovedUsers.sort(userSort);
                                                tempCurrUsers.sort(userSort);
                                                setCurrUsers(tempCurrUsers);
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
                            setState("empty");
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
                <AltModal
                    {...{
                        active: showSettingsModal,
                        body: SettingsModal,
                        callback: () => {
                            setShowSettingsModal(false);
                            setState("empty");
                            setNewName(project.name);
                            setNewDesc(project.description);
                        },
                    }}
                />
                <AltModal
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
                        <ButtonArray className="border-2 border-orange-300">
                            {isAdmin ? (
                                <Button onClick={() => setShowSettingsModal(true)}>Settings</Button>
                            ) : (
                                <NoEffectButton disabled className="bg-slate-400">
                                    Settings
                                </NoEffectButton>
                            )}
                            {isAdmin ? (
                                <Button onClick={() => setShowInviteWindow(true)} disabled={!isAdmin}>
                                    Invite
                                </Button>
                            ) : (
                                <NoEffectButton disabled className="bg-slate-400">
                                    Invite
                                </NoEffectButton>
                            )}
                            <ButtonLeaveProject
                                onClick={() => {
                                    setShowLeaveModal(true);
                                }}
                            >
                                Leave Project
                            </ButtonLeaveProject>
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
