import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { DataContext } from "../context/DataProvider";
import { BaseButton, IconButton, InputCSS } from "../styles";
import { IProject } from "../types";

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    margin-top: 3rem;
    width: 100%;
`;

const Row = styled.div`
    align-items: center;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    text-align: center;
    width: 50%;
`;

const Title = styled.h1`
    font-size: xx-large;
`;

const Form = styled.form`
    width: 50%;
`;

const Label = styled.label`
    display: flex;
    flex-direction: column;
    text-align: left;
    margin-top: 1rem;
`;

const Input = styled.input`
    ${InputCSS}
    width: 100%;
`;

const TextArea = styled.textarea`
    ${InputCSS}
    width: 100%;
    height: 10rem;
`;

const Button = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
    float: right;
    margin-top: 1rem;
`;

const ButtonSubmit = styled(Button)`
    background-color: rgb(255, 85, 0);
    border: 1px solid rgb(255, 85, 0);
`;

const ErrorMessage = styled.div`
    background-color: red;
    border-radius: 6px;
    color: white;
    padding: 0.2rem 0.5rem;
`;

interface IFields {
    id?: string;
    name: string;
    description: string;
}

const emptyFields: IFields = {
    name: "",
    description: "",
};

const isValidProjectName = (name: string): [string, boolean] => {
    if (name === "") {
        return ["Error: Provide a name!", false];
    } else if (name.length < 5) {
        return ["Error: Name too short", false];
    }
    return ["", true];
};

const ProjectCreate = (): JSX.Element => {
    const data = useContext(DataContext);

    const [fields, setFields] = useState<IFields>(emptyFields);
    type states = "no" | "loading" | "ready";
    const [state, setState] = useState<states>("no");
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (event) => {
        event.preventDefault();

        setFields((f) => {
            return { ...f, [event.target.name]: event.target.value };
        });
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        const [msg, ok] = isValidProjectName(fields.name);
        if (!ok) {
            setErrorMessage(msg);
            return;
        }

        setErrorMessage(undefined);

        const project: IProject = {
            id: "",
            name: fields.name,
            description: fields.description,
            members: [],
            events: [],
            tasks: [],
            creationTime: new Date(),
        };

        setState("loading");

        data.addProject(project).then((id) => {
            setFields((f) => {
                return { ...f, id };
            });

            setState("ready");
        });
    };

    const buttonSwitch = {
        no: <ButtonSubmit type="submit">Submit</ButtonSubmit>,
        loading: <Button disabled>Creating project...</Button>,
        ready: (
            <Button type="button">
                <Link to={`/project/${fields.id}`}>Go to Project Page</Link>
            </Button>
        ),
    };

    return (
        <Container>
            <Row>
                <Button className="flex-1">
                    <Link to="/projects">⬅️ Back to Projects</Link>
                </Button>
                <Title className="flex-1">Create Project</Title>
                {/* empty div just to create spacing */}
                <div className="flex-1"></div>
            </Row>
            <Form onSubmit={handleSubmit}>
                <Label>Name</Label>
                <Input type="text" name="name" onChange={handleChange} value={fields.name} autoFocus required />
                <Label>Description</Label>
                <TextArea name="description" onChange={handleChange} value={fields.description} />

                {/* render the correct button based on current state */}
                {buttonSwitch[state]}
            </Form>

            {errorMessage !== undefined && (
                <ErrorMessage>
                    {errorMessage}
                    <IconButton className="pl-2" onClick={() => setErrorMessage(undefined)}>
                        &times;
                    </IconButton>
                </ErrorMessage>
            )}
        </Container>
    );
};

export default ProjectCreate;
