import moment from "moment";
import { useContext, useState } from "react";
import styled from "styled-components";
import { DataContext } from "../context/DataProvider";
import { Button, InputCSS } from "../styles";
import { ITask } from "../types";

const Container = styled.div<{ width: number }>`
    -webkit-transform: translate(-50%, -50%);
    background-color: white;
    border: 1px solid rgb(59, 130, 246);
    left: 50%;
    padding: 1rem 1.5rem;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%); // https://stackoverflow.com/a/23384995
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

const ButtonSubmit = styled(Button)`
    background-color: rgb(255, 85, 0);
    border: 1px solid rgb(255, 85, 0);
    float: right;
    margin-top: 1rem;
`;

const ButtonCancel = styled(Button)`
    background-color: white;
    border: 1px solid black;
    color: black;
    float: right;
    margin-top: 1rem;
`;

interface IFields {
    id: string;
    name: string;
    assignedTo?: string;
    description: string;
    creationTime?: Date;
    deadline?: Date;
    isDone: boolean;
    // essentially only tags is different
    tags: string;
}

const TodoEdit = ({
    width,
    editingTask,
    setEditingTask,
}: {
    width: number;
    editingTask: ITask;
    setEditingTask: React.Dispatch<React.SetStateAction<ITask | undefined>>;
}): JSX.Element => {
    const data = useContext(DataContext);

    const [fields, setFields] = useState<IFields>({ ...editingTask, tags: editingTask.tags.join(", ") });

    const hideForm = () => {
        setEditingTask(undefined);
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

        const task: ITask = { ...fields, tags };

        data.patchTask(task);
        hideForm();
    };

    return (
        <Container width={width}>
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
                    type="date"
                    name="deadline"
                    onChange={handleChange}
                    value={fields.deadline !== undefined ? moment(fields.deadline).format("YYYY-MM-DD") : ""}
                />
                <ButtonSubmit type="submit">Submit</ButtonSubmit>
                <ButtonCancel onClick={hideForm}>Cancel</ButtonCancel>
            </Form>
        </Container>
    );
};

export default TodoEdit;
