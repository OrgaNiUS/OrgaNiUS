import moment from "moment";
import { useContext, useState } from "react";
import styled from "styled-components";
import { DataContext } from "../../context/DataProvider";
import { isEqualArrays } from "../../functions/arrays";
import { BaseButton, InputCSS } from "../../styles";
import { ITask } from "../../types";
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
    top: 50%;
    z-index: 1;
    width: ${(props) => props.width}%;
`;

const Form = styled.form``;

const Title = styled.h1`
    font-size: large;
    margin-bottom: 0.2rem;
`;

const Label = styled.label`
    margin-top: 0.3rem;
    float: left;
`;

const Input = styled.input`
    ${InputCSS}
    width: 100%;
`;

const TextArea = styled.textarea`
    ${InputCSS}
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

interface IFields {
    id: string;
    name: string;
    assignedTo: string[];
    description: string;
    creationTime: Date;
    deadline?: Date;
    isDone: boolean;
    // essentially only tags is different
    tags: string;
}

const TodoEdit = ({ view }: { view: TodoView }): JSX.Element => {
    const data = useContext(DataContext);
    const props = useContext(TodoContext);

    // can assert this because TodoEdit is only ever called when editingTask is not undefined
    // just let React crash if the developer passes in undefined (not supposed to happen anyways)
    const editingTask: ITask = props.editingTask as ITask;

    const [fields, setFields] = useState<IFields>({ ...editingTask, tags: editingTask.tags.join(", ") });

    const hideForm = () => {
        props.setEditingTask(undefined);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        event.preventDefault();

        if (event.target.name === "deadline") {
            const date = event.target.value === "" ? undefined : moment(event.target.value).toDate();

            setFields((f) => {
                return { ...f, deadline: date };
            });
        } else {
            setFields((f) => {
                return { ...f, [event.target.name]: event.target.value };
            });
        }
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (fields.name === "") {
            // Double check that name is not empty.
            return;
        }

        // Tags are delimited by commas and trimmed of whitespace.
        const tags: string[] = fields.tags === "" ? [] : fields.tags.split(",").map((s) => s.trim());

        const task: Partial<ITask> = {
            id: editingTask.id,
        };

        // Add to partial task if not the same.
        if (fields.name !== editingTask.name) {
            task.name = fields.name;
        }
        if (!isEqualArrays(fields.assignedTo, editingTask.assignedTo)) {
            task.assignedTo = fields.assignedTo;
        }
        if (fields.description !== editingTask.description) {
            task.description = fields.description;
        }
        if (fields.creationTime !== editingTask.creationTime) {
            task.creationTime = fields.creationTime;
        }
        if (fields.deadline !== editingTask.deadline) {
            task.deadline = fields.deadline;
        }
        if (fields.isDone !== editingTask.isDone) {
            task.isDone = fields.isDone;
        }
        if (!isEqualArrays(tags, editingTask.tags)) {
            task.tags = tags;
        }

        data.patchTask(task);
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
                <Label>Deadline</Label>
                <Input
                    type="datetime-local"
                    name="deadline"
                    onChange={handleChange}
                    value={fields.deadline !== undefined ? moment(fields.deadline).format("YYYY-MM-DD HH:mm") : ""}
                />
                <ButtonSubmit type="submit">Submit</ButtonSubmit>
                <ButtonCancel onClick={hideForm}>Cancel</ButtonCancel>
            </Form>
        </Container>
    );
};

export default TodoEdit;
