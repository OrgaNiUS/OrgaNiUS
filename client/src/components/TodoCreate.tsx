import moment from "moment";
import { useContext, useState } from "react";
import styled, { FlattenSimpleInterpolation } from "styled-components";
import { DataContext } from "../context/DataProvider";
import { Button, IconButton, InputCSS } from "../styles";
import { ITask } from "../types";

const ButtonAdd = styled(IconButton)<{ custom: FlattenSimpleInterpolation }>`
    ${(props) => props.custom}
`;

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
    iconCSS,
}: {
    containerWidth: number;
    iconCSS: FlattenSimpleInterpolation;
}): JSX.Element => {
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
        console.log(event.target.name);
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
        console.log("submitting?");
        event.preventDefault();
        if (fields.name === "") {
            // Double check that name is not empty.
            return;
        }

        // Tags are delimited by commas and trimmed of whitespace.
        const tags: string[] = fields.tags === "" ? [] : fields.tags.split(",").map((s) => s.trim());

        const task: ITask = {
            id: "",
            name: fields.name,
            description: fields.description,
            creationTime: new Date(),
            deadline: fields.deadline,
            isDone: false,
            tags: tags,
        };

        data.addTask(task);
        hideForm();
    };

    return (
        <>
            {displayForm && (
                <Container width={containerWidth}>
                    <Form onSubmit={handleSubmit}>
                        <Title>Add Task</Title>
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
            )}
            <ButtonAdd custom={iconCSS}>
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
            </ButtonAdd>
        </>
    );
};

export default TodoCreate;
