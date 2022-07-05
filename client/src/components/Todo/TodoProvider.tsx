import { createContext, useContext, useState } from "react";
import { DataContext } from "../../context/DataProvider";
import { filterTaskOptions, filterTasks } from "../../functions/events";
import { ITask, IUser } from "../../types";

interface ITodoContext {
    selected: string; // selected task id
    setSelected: React.Dispatch<React.SetStateAction<string>>;
    taskDone: (task: ITask) => void;
    taskTrash: (task: ITask) => void;
    taskEdit: (task: ITask) => void;
    editingTask: ITask | undefined;
    setEditingTask: React.Dispatch<React.SetStateAction<ITask | undefined>>;
    tasks: ITask[];
    filteredTasks: ITask[];
    filterOptions: filterTaskOptions;
    setFilterOptions: React.Dispatch<React.SetStateAction<filterTaskOptions>>;
    showModal: () => void;
    hideModal: () => void;
    handleSearch: React.ChangeEventHandler<HTMLInputElement>;
    isPersonal: boolean;
    projectid: string;
    createCallback: (_: ITask | undefined) => void;
    editCallback: (_: ITask | undefined) => void;
    members: IUser[];
}

const defaultFunc = () => {};

const defaultTodoContext: ITodoContext = {
    selected: "",
    setSelected: defaultFunc,
    taskDone: defaultFunc,
    taskTrash: defaultFunc,
    taskEdit: defaultFunc,
    editingTask: undefined,
    setEditingTask: defaultFunc,
    tasks: [],
    filteredTasks: [],
    filterOptions: {
        done: true,
        expired: true,
        personal: true,
        project: true,
        searchTerm: "",
    },
    setFilterOptions: defaultFunc,
    showModal: defaultFunc,
    hideModal: defaultFunc,
    handleSearch: defaultFunc,
    isPersonal: true,
    projectid: "",
    createCallback: defaultFunc,
    editCallback: defaultFunc,
    members: [],
};

export const TodoContext = createContext<ITodoContext>(defaultTodoContext);

export const TodoProvider = ({
    children,
    projectid,
    tasks,
    defaultFilterOptions,
    setIsModalShown,
    doneTrigger,
    trashTrigger,
    createCallback,
    editCallback,
    members,
    initEditTask,
}: {
    children: JSX.Element;
    projectid: string;
    tasks: ITask[];
    defaultFilterOptions: filterTaskOptions;
    setIsModalShown: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    doneTrigger?: (task: ITask) => void;
    trashTrigger?: (task: ITask) => void;
    createCallback?: (task: ITask | undefined) => void;
    editCallback?: (task: ITask | undefined) => void;
    members?: IUser[];
    initEditTask?: ITask;
}) => {
    const data = useContext(DataContext);
    /**
     * ID of selected task.
     * Selected task => 3-dot menu open.
     */
    const [selected, setSelected] = useState<string>("");
    const [editingTask, setEditingTask] = useState<ITask | undefined>(initEditTask);

    const taskDone = (task: ITask) => {
        if (task === undefined) {
            return;
        }
        if (doneTrigger !== undefined) {
            // use provided done trigger instead
            doneTrigger(task);
        } else {
            data.patchTask(
                {
                    id: task.id,
                    isDone: !task.isDone,
                },
                task
            );
        }
        setSelected("");
    };

    const taskTrash = (task: ITask) => {
        if (trashTrigger !== undefined) {
            // use provided trash trigger instead
            trashTrigger(task);
        } else {
            const id: string = task.id;
            const toBeTrashed: string[] = [id];
            data.removeTasks(toBeTrashed);
        }
        setSelected("");
    };

    const taskEdit = (task: ITask) => {
        setEditingTask(task);
        setSelected("");
    };

    const [filterOptions, setFilterOptions] = useState<filterTaskOptions>(defaultFilterOptions);
    const filteredTasks: ITask[] = filterTasks(tasks, filterOptions);

    const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();
        setFilterOptions((opts) => {
            return { ...opts, searchTerm: event.target.value };
        });
    };

    const showModal = () => {
        if (setIsModalShown === undefined) {
            return;
        }
        setIsModalShown(true);
    };

    const hideModal = () => {
        if (setIsModalShown === undefined) {
            return;
        }
        setIsModalShown(false);
    };

    const defaultCb = (_: ITask | undefined) => {};

    return (
        <TodoContext.Provider
            value={{
                selected,
                setSelected,
                taskDone,
                taskTrash,
                taskEdit,
                editingTask,
                setEditingTask,
                tasks,
                filteredTasks,
                filterOptions,
                setFilterOptions,
                showModal,
                hideModal,
                handleSearch,
                isPersonal: projectid === "",
                projectid,
                createCallback: createCallback ?? defaultCb,
                editCallback: editCallback ?? defaultCb,
                members: members ?? [],
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};
