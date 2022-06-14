import { useState } from "react";
import { filterTaskOptions, filterTasks } from "../functions/events";
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
        deadline: new Date(2022, 6, 12),
        isDone: false,
        tags: ["tag1", "tag2"],
    },
    {
        name: "5 Days Later",
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        isDone: false,
        tags: [],
    },
    {
        name: "13 Hours Later",
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 13),
        isDone: false,
        tags: [],
    },
    {
        name: "Task with only Title",
        description: "",
        isDone: false,
        tags: [],
    },
    {
        name: "",
        description: "",
        isDone: false,
        tags: [],
    },
    {
        name: "Task above me is empty.",
        description: "Might as well not exist, I guess.",
        isDone: false,
        tags: [],
    },
    {
        name: "This task is done.",
        description: "",
        isDone: true,
        tags: [],
    },
    {
        name: "This task is expired but not done.",
        description: "",
        isDone: false,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        name: "This task is expired and done.",
        description: "",
        isDone: true,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        name: "Really long description...",
        description:
            " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla pharetra tincidunt condimentum. Fusce vitae consequat est, vitae convallis tellus. Fusce et ligula volutpat, consequat augue id, efficitur eros. Vivamus id metus orci. Donec eu felis at mauris tempus pellentesque sed id nibh.  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla pharetra tincidunt condimentum. Fusce vitae consequat est, vitae convallis tellus. Fusce et ligula volutpat, consequat augue id, efficitur eros. Vivamus id metus orci. Donec eu felis at mauris tempus pellentesque sed id nibh.  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla pharetra tincidunt condimentum. Fusce vitae consequat est, vitae convallis tellus. Fusce et ligula volutpat, consequat augue id, efficitur eros. Vivamus id metus orci. Donec eu felis at mauris tempus pellentesque sed id nibh.",
        isDone: false,
        tags: [],
    },
];

const Dropdown = ({
    filterOptions,
    setFilterOptions,
}: {
    filterOptions: filterTaskOptions;
    setFilterOptions: React.Dispatch<React.SetStateAction<filterTaskOptions>>;
}): JSX.Element => {
    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        const key: string = event.target.name;
        const value: boolean = event.target.checked;

        setFilterOptions((opts) => {
            return { ...opts, [key]: value };
        });
    };

    return (
        <div className={styler("filter-dropdown-content")}>
            <b>Filter Options</b>
            <div>
                <input type="checkbox" name={"done"} checked={filterOptions.done} onChange={handleChange} />
                <label className="ml-1">Done</label>
            </div>
            <div>
                <input type="checkbox" name={"expired"} checked={filterOptions.expired} onChange={handleChange} />
                <label className="ml-1">Expired</label>
            </div>
        </div>
    );
};

// TODO: Todo Modal View
const TodoModal: JSX.Element = <div>I am the Todo expanded view.</div>;

const Todo = (): JSX.Element => {
    const [filterOptions, setFilterOptions] = useState<filterTaskOptions>({
        done: false,
        expired: false,
        searchTerm: "",
    });
    const [showModal, setShowModal] = useState<boolean>(false);

    const filteredTasks: ITask[] = filterTasks(tasks, filterOptions);

    const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        setFilterOptions((opts) => {
            return { ...opts, searchTerm: event.target.value };
        });
    };

    return (
        <>
            <Modal {...{ active: showModal, body: TodoModal, callback: () => setShowModal(false) }} />
            <div className={styler("wrapper")}>
                <div className={styler("container")}>
                    <h1 className={styler("title")}>To-Do</h1>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={filterOptions.searchTerm}
                        onChange={handleSearch}
                        className={styler("search-box")}
                    />
                    {filteredTasks.length === 0 ? (
                        <div>Nothing here!</div>
                    ) : (
                        filteredTasks.map((task, i) => {
                            return <Task key={i} {...{ task }} />;
                        })
                    )}
                </div>
                <div className={styler("filter-dropdown")}>
                    <button className={styler("filter-button")}>
                        {/* "filter" from https://heroicons.com/ */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                            />
                        </svg>
                    </button>
                    <Dropdown {...{ filterOptions, setFilterOptions }} />
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
                        onClick={() => setShowModal(true)}
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
