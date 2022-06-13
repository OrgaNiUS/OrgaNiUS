import { useState } from "react";
import StylesMerger from "../styles/StyleMerging";
import styles from "../styles/Todo.module.css";
import { ITask } from "../types";
import Modal from "./Modal";
import Task from "./Task";

const styler = StylesMerger(styles);

// TODO: This is only for testing purposes because actual tasks are to be implemented later on.
const tasks: ITask[] = [
    {
        name: "Task 1",
        description: "This is a short description.",
        tags: ["tag1", "tag2"],
        deadline: new Date(2022, 6, 12),
    },
    {
        name: "5 Days Later",
        description: "",
        tags: [],
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    },
    {
        name: "13 Hours Later",
        description: "",
        tags: [],
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 13),
    },
    {
        name: "Task with only Title",
        description: "",
        tags: [],
    },
    {
        name: "",
        description: "",
        tags: [],
    },
    {
        name: "Task above me is empty.",
        description: "Might as well not exist, I guess.",
        tags: [],
    },
    // {
    //     name: "Really long description...",
    //     description:
    //         " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla pharetra tincidunt condimentum. Fusce vitae consequat est, vitae convallis tellus. Fusce et ligula volutpat, consequat augue id, efficitur eros. Vivamus id metus orci. Donec eu felis at mauris tempus pellentesque sed id nibh.  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla pharetra tincidunt condimentum. Fusce vitae consequat est, vitae convallis tellus. Fusce et ligula volutpat, consequat augue id, efficitur eros. Vivamus id metus orci. Donec eu felis at mauris tempus pellentesque sed id nibh.  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla pharetra tincidunt condimentum. Fusce vitae consequat est, vitae convallis tellus. Fusce et ligula volutpat, consequat augue id, efficitur eros. Vivamus id metus orci. Donec eu felis at mauris tempus pellentesque sed id nibh.",
    //     tags: [],
    // },
];

const TodoModal: JSX.Element = <div>I am the Todo expanded view.</div>;

const Todo = (): JSX.Element => {
    const [showModal, setShowModal] = useState<boolean>(false);

    // TODO: for now, there is no filtering mechanism, so this is just a placeholder.
    // TODO: filtering mechanism
    const filteredTasks: ITask[] = tasks;

    // TODO: Todo Modal View

    const handleExpand = () => {
        setShowModal(true);
    };

    return (
        <>
            <Modal {...{ active: showModal, body: TodoModal, callback: () => setShowModal(false) }} />
            <div className={styler("wrapper")}>
                <div className={styler("container")}>
                    <h1 className={styler("title")}>To-Do</h1>
                    {filteredTasks.length === 0 ? (
                        <div>Nothing here!</div>
                    ) : (
                        filteredTasks.map((task, i) => {
                            return <Task key={i} {...{ task }} />;
                        })
                    )}
                </div>
                <button className={styler("expand-button")}>
                    {/* "arrows-expand" from https://heroicons.com/ */}
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        onClick={handleExpand}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                    </svg>
                </button>
            </div>
        </>
    );
};

export default Todo;
