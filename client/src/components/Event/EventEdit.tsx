import moment from "moment";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { DataContext, patchEventData } from "../../context/DataProvider";
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
    id: string;
    name: string;
    start: string;
    end: string;
}

const momentFormat: string = "YYYY-MM-DD HH:mm";

// A lot of code is reused from TodoEdit, but not worth creating a generic edit form to extend from.

const EventEdit = (): JSX.Element => {
    const data = useContext(DataContext);

    const [fields, setFields] = useState<IFields>({
        // this fake values are because Modal will force all values here to be evaluated, thus need to provide *some* value (will be changed when user actually clicks on edit).
        id: "",
        name: "",
        start: "",
        end: "",
    });

    useEffect(() => {
        // force fields to change when editingEvent changes
        // workaround to having to create this early for modal animation
        if (data.editingEvent === undefined) {
            return;
        }

        setFields({
            ...data.editingEvent,
            start: moment(data.editingEvent.start).format(momentFormat),
            end: moment(data.editingEvent.end).format(momentFormat),
        });
    }, [data.editingEvent]);

    const hideForm = () => {
        data.setEditingEvent(undefined);
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

        if (data.editingEvent === undefined) {
            // done for TS compiler
            return;
        }

        const editingEvent: IEvent = data.editingEvent;

        const event: patchEventData = {
            id: editingEvent.id,
        };

        // Add to partial event if not the same.
        if (fields.name !== editingEvent.name) {
            event.name = fields.name;
        }

        const start: Date | undefined = fields.start === undefined ? undefined : moment(fields.start).toDate();
        if (start !== editingEvent.start) {
            event.start = start;
        }
        const end: Date | undefined = fields.end === undefined ? undefined : moment(fields.end).toDate();
        if (end !== editingEvent.end) {
            event.end = end;
        }

        data.patchEvent(event);
        hideForm();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Title>Editing Event</Title>
            <Label>Name</Label>
            <Input type="text" name="name" placeholder="Name" onChange={handleChange} value={fields.name} required />
            <Label>Start</Label>
            <Input type="datetime-local" name="start" onChange={handleChange} value={fields.start} />
            <Label>End</Label>
            <Input type="datetime-local" name="end" onChange={handleChange} value={fields.end} />
            <ButtonSubmit type="submit">Submit</ButtonSubmit>
            <ButtonCancel onClick={hideForm}>Cancel</ButtonCancel>
        </Form>
    );
};

export default EventEdit;
