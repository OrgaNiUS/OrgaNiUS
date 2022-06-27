import moment from "moment";
import { useContext, useState } from "react";
import styled from "styled-components";
import AuthContext from "../context/AuthProvider";
import { DataContext } from "../context/DataProvider";
import { BaseButton, IconButton, InputCSS } from "../styles";
import { ITask } from "../types";

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
    name: string;
    description: string;
    tags: string;
    deadline?: Date;
}

const emptyFields: IFields = {
    name: "",
    description: "",
    tags: "",
};

const TodoCreate = ({
    containerWidth,
    isPersonal,
    projectid,
    createCallback,
}: {
    containerWidth: number;
    isPersonal: boolean;
    projectid: string;
    createCallback: (task: ITask | undefined) => void;
}): [JSX.Element, JSX.Element] => {
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);

    const [fields, setFields] = useState<IFields>(emptyFields);
    const [displayForm, setDisplayForm] = useState<boolean>(false);

    const showForm = () => {
        setDisplayForm(true);
        setFields(emptyFields);
    };

    const hideForm = () => {
        setDisplayForm(false);
        setFields(emptyFields);
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

        const assignedTo: string[] = auth.auth.id === undefined ? [] : [auth.auth.id];
        // Tags are delimited by commas and trimmed of whitespace.
        const tags: string[] = fields.tags === "" ? [] : fields.tags.split(",").map((s) => s.trim());

        const task: ITask = {
            id: "",
            name: fields.name,
            assignedTo,
            description: fields.description,
            creationTime: new Date(),
            deadline: fields.deadline,
            isDone: false,
            tags: tags,
            isPersonal: isPersonal,
        };

        data.addTask(task, projectid).then(createCallback);
        hideForm();
    };

    const form: JSX.Element = displayForm ? (
        <Container width={containerWidth} isPersonal={isPersonal}>
            <Form onSubmit={handleSubmit}>
                <Title>Add Task</Title>
                <Label>Name</Label>
                <Input
                    type="text"
                    name="name"
                    placeholder="Name"
                    onChange={handleChange}
                    value={fields.name}
                    autoFocus
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
    ) : (
        <></>
    );

    const button = (
        <IconButton>
            {/* plus from https://heroicons.com/ */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                onClick={showForm}
            >
                <title>Add Task</title>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
        </IconButton>
    );

    return [button, form];
};

export default TodoCreate;
