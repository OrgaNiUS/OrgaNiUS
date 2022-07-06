import moment from "moment";
import { useContext, useState } from "react";
import styled from "styled-components";
import { DataContext, patchTaskData } from "../../context/DataProvider";
import { getDeltaOfArrays, isEqualArrays } from "../../functions/arrays";
import { BaseButton, IconButton, InputCSS } from "../../styles";
import { ITask, IUser } from "../../types";
import { TodoView } from "./Todo";
import { TodoContext } from "./TodoProvider";

const Container = styled.div<{ width: number; isPersonal: boolean }>`
    ${(props) => {
        const y: number = props.isPersonal ? -50 : 0;
        // https://stackoverflow.com/a/23384995
        return `
        -webkit-transform: translate(-50%, ${y}%);
        transform: translate(-50%, ${y}%);
        `;
    }}
    background-color: white;
    border: 1px solid rgb(59, 130, 246);
    left: 50%;
    padding: 1rem 1.5rem;
    position: absolute;
    ${(props) => (props.isPersonal ? "top: 50%;" : "")}
    z-index: 1;
    width: ${(props) => props.width}%;
`;

const Form = styled.form``;

const Title = styled.h1`
    font-size: large;
    margin-bottom: 0.2rem;
`;

const Label = styled.label`
    float: left;
    margin-top: 0.3rem;
    width: 100%;
`;

const Input = styled.input`
    ${InputCSS}
    width: 100%;
`;

const TextArea = styled.textarea`
    ${InputCSS}
    width: 100%;
`;

const Users = styled.div`
    cursor: pointer;
    width: 100%;
`;

const ButtonSubmit = styled(BaseButton)`
    background-color: rgb(255, 85, 0);
    border: 1px solid rgb(255, 85, 0);
    float: right;
    margin-top: 1rem;
`;

const ButtonCancel = styled(BaseButton)`
    background-color: white;
    border: 1px solid black;
    color: black;
    float: right;
    margin-top: 1rem;
`;

const ButtonAssign = styled(IconButton)`
    vertical-align: middle;
`;

interface IFields {
    id: string;
    name: string;
    assignedTo: IUser[] /* contains entire User object instead of ID, will be parsed to ID before submitting */;
    currentAssign: string;
    description: string;
    creationTime: Date;
    deadline?: string;
    isDone: boolean;
    // essentially only tags is different
    tags: string;
}

const momentFormat: string = "YYYY-MM-DD HH:mm";

const TodoEdit = ({ view }: { view: TodoView }): JSX.Element => {
    const data = useContext(DataContext);
    const props = useContext(TodoContext);

    // can assert this because TodoEdit is only ever called when editingTask is not undefined
    // just let React crash if the developer passes in undefined (not supposed to happen anyways)
    const editingTask: ITask = props.editingTask as ITask;

    // change ID to user using props.members as a "dictionary"
    // assert at the end because TypeScript doesn't realise that filtering out undefined essentially changes the type as well
    const assignedTo: IUser[] = props.isPersonal
        ? []
        : (editingTask.assignedTo
              .map((user) => props.members.find((member) => user.id === member.id))
              .filter((x) => x !== undefined) as IUser[]);

    const [fields, setFields] = useState<IFields>({
        ...editingTask,
        deadline: editingTask.deadline === undefined ? undefined : moment(editingTask.deadline).format(momentFormat),
        tags: editingTask.tags.join(", "),
        assignedTo,
        currentAssign: "",
    });

    const hideForm = () => {
        props.setEditingTask(undefined);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        event.preventDefault();

        if (event.target.name === "deadline") {
            const date: string | undefined =
                event.target.value === "" ? undefined : moment(event.target.value).format(momentFormat);

            setFields((f) => {
                return { ...f, deadline: date };
            });
        } else {
            setFields((f) => {
                return { ...f, [event.target.name]: event.target.value };
            });
        }
    };

    const handleAddAssigned = (user: IUser) => {
        const name: string = user.name;

        setFields((f) => {
            const user: IUser | undefined = props.members.find((u) => u.name === name);
            // these checks are relatively pointless because they should never happen (user can only select from some set of valid names)
            // but just in case
            if (user === undefined) {
                return f;
            }
            if (f.assignedTo.some((u) => u.name === name)) {
                // don't include same user more than once
                return f;
            }
            const assignedTo: IUser[] = [...f.assignedTo, user];
            return { ...f, assignedTo, currentAssign: "" };
        });
    };

    const handleRemoveAssigned = (user: IUser) => {
        setFields((f) => {
            const assignedTo: IUser[] = f.assignedTo.filter((x) => x.id !== user.id);
            return { ...f, assignedTo };
        });
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (fields.name === "") {
            // Double check that name is not empty.
            return;
        }

        // Tags are delimited by commas and trimmed of whitespace.
        const tags: string[] = fields.tags === "" ? [] : fields.tags.split(",").map((s) => s.trim());

        const task: patchTaskData = {
            id: editingTask.id,
        };

        // Add to partial task if not the same.
        if (fields.name !== editingTask.name) {
            task.name = fields.name;
        }
        // check that the user ids are equal (comparing objects will be incorrect)
        if (
            !isEqualArrays(
                fields.assignedTo.map((u) => u.id),
                editingTask.assignedTo.map((u) => u.id)
            )
        ) {
            const [added, removed] = getDeltaOfArrays(
                editingTask.assignedTo.map((u) => u.id),
                fields.assignedTo.map((u) => u.id)
            );
            if (added !== []) {
                task.addAssignedTo = added;
                task.assignedTo = fields.assignedTo;
            }
            if (removed !== []) {
                task.removeAssignedTo = removed;
                task.assignedTo = fields.assignedTo;
            }
        }
        if (fields.description !== editingTask.description) {
            task.description = fields.description;
        }
        if (fields.creationTime !== editingTask.creationTime) {
            task.creationTime = fields.creationTime;
        }
        const deadline: Date | undefined = fields.deadline === undefined ? undefined : moment(fields.deadline).toDate();
        if (deadline !== editingTask.deadline) {
            task.deadline = deadline;
        }
        if (fields.isDone !== editingTask.isDone) {
            task.isDone = fields.isDone;
        }
        if (!isEqualArrays(tags, editingTask.tags)) {
            task.tags = tags;
        }

        data.patchTask(task, { ...fields, deadline, tags, isPersonal: editingTask.isPersonal });
        props.editCallback({ ...editingTask, ...task });
        hideForm();
    };

    const containerWidth = {
        list: 80,
        grid: 60,
        project: 60,
    };

    return (
        <Container width={containerWidth[view]} isPersonal={props.isPersonal}>
            <Form onSubmit={handleSubmit}>
                <Title>Editing Task</Title>
                <Label>Name</Label>
                <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={handleChange}
                    value={fields.name}
                    required
                />
                <Label>Description</Label>
                <TextArea
                    name="description"
                    placeholder="Description"
                    onChange={handleChange}
                    value={fields.description}
                />
                <Label>Tags (separate with commas)</Label>
                <Input type="text" name="tags" placeholder="Tags" onChange={handleChange} value={fields.tags} />
                {!props.isPersonal && (
                    <>
                        <Label>Assigned To</Label>
                        {fields.assignedTo.map((user, i) => (
                            <Users key={i} onClick={() => handleRemoveAssigned(user)}>
                                {user.name + " "}
                                {/* have to change type to button to not trigger form submission! */}
                                <ButtonAssign type="button">
                                    {/* minus-circle from https://heroicons.com/ */}
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
                                            d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </ButtonAssign>
                            </Users>
                        ))}
                        <Input
                            type="text"
                            name="currentAssign"
                            placeholder="Add user..."
                            onChange={handleChange}
                            value={fields.currentAssign}
                        />
                        {fields.currentAssign !== "" &&
                            props.members
                                .filter(
                                    (u) =>
                                        /*
                                            really ugly compressed code but basically
                                            1. if not already assigned
                                            2. if (lower case) matches the currentAssign field
                                            then render in the suggestions
                                        */
                                        !fields.assignedTo.some((v) => v.id === u.id) &&
                                        u.name.toLowerCase().includes(fields.currentAssign.toLowerCase())
                                )
                                .map((user, i) => (
                                    <Users key={i} onClick={() => handleAddAssigned(user)}>
                                        {user.name + " "}
                                        <ButtonAssign type="button">
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
                                                    d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </ButtonAssign>
                                    </Users>
                                ))}
                    </>
                )}
                <Label>Deadline</Label>
                <Input type="datetime-local" name="deadline" onChange={handleChange} value={fields.deadline} />
                <ButtonSubmit type="submit">Submit</ButtonSubmit>
                <ButtonCancel onClick={hideForm}>Cancel</ButtonCancel>
            </Form>
        </Container>
    );
};

export default TodoEdit;
