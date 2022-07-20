import moment from "moment";
import { useContext, useState } from "react";
import styled from "styled-components";
import { DataContext } from "../../context/DataProvider";
import { BaseButton, InputCSS } from "../../styles";
import { IEvent } from "../../types";

const Form = styled.form`
    width: 30vw;
`;

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
    start: string;
    end: string;
}

const momentFormat: string = "YYYY-MM-DD HH:mm";

const EventCreate = ({
    show,
    setShow,
}: {
    show: boolean;
    setShow: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
    const data = useContext(DataContext);

    const [fields, setFields] = useState<IFields>({
        name: "",
        start: new Date().toISOString(),
        end: new Date().toISOString(),
    });

    const hideForm = () => {
        setShow(false);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        // using "e" to prevent confusion with "event"
        e.preventDefault();

        if (e.target.name === "start" || e.target.name === "end") {
            const date: string | undefined =
                e.target.value === "" ? undefined : moment(e.target.value).format(momentFormat);

            setFields((f) => {
                return { ...f, [e.target.name]: date };
            });
        } else {
            setFields((f) => {
                return { ...f, [e.target.name]: e.target.value };
            });
        }
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        // using "e" to prevent confusion with "event"
        e.preventDefault();

        if (fields.name === "") {
            // Double check that name is not empty.
            return;
        }

        const event: IEvent = {
            id: "",
            name: fields.name,
            start: moment(fields.start).toDate(),
            end: moment(fields.end).toDate(),
        };

        data.addEvent(event);
        hideForm();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Title>New Event</Title>
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
            <Label>Start</Label>
            <Input type="datetime-local" name="start" onChange={handleChange} value={fields.start} required />
            <Label>End</Label>
            <Input type="datetime-local" name="end" onChange={handleChange} value={fields.end} required />
            <ButtonSubmit type="submit">Submit</ButtonSubmit>
            <ButtonCancel onClick={hideForm}>Cancel</ButtonCancel>
        </Form>
    );
};

export default EventCreate;
