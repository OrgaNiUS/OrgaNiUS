import StylesMerger from "../styles/StyleMerging";
import styles from "../styles/Todo.module.css";
import { ITask } from "../types";
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

const Todo = (): JSX.Element => {
    // TODO: for now, there is no filtering mechanism, so this is just a placeholder.
    const filteredTasks: ITask[] = tasks;

    return (
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
    );
};

export default Todo;
