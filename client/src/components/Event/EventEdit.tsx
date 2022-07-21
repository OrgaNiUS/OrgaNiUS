import { useContext, useEffect, useState } from "react";
import DateTimePicker from "react-datetime-picker";
import styled from "styled-components";
import { DataContext, patchEventData } from "../../context/DataProvider";
import { dateDiff } from "../../functions/dates";
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
    start: Date | undefined;
    end: Date | undefined;
}

// A lot of code is reused from TodoEdit, but not worth creating a generic edit form to extend from.

const EventEdit = (): JSX.Element => {
    const data = useContext(DataContext);

    const [fields, setFields] = useState<IFields>({
        // this fake values are because Modal will force all values here to be evaluated, thus need to provide *some* value (will be changed when user actually clicks on edit).
        id: "",
        name: "",
        start: undefined,
        end: undefined,
    });
    const [message, setMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        // force fields to change when editingEvent changes
        // workaround to having to create this early for modal animation
        if (data.editingEvent === undefined) {
            return;
        }

        setFields({
            ...data.editingEvent,
            start: data.editingEvent.start,
            end: data.editingEvent.end,
        });
    }, [data.editingEvent]);

    const hideForm = () => {
        data.setEditingEvent(undefined);
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
        // using "e" to prevent confusion with "event"
        e.preventDefault();

        setFields((f) => {
            return { ...f, [e.target.name]: e.target.value };
        });
    };

    const handleDateChange = (field: string) => {
        return (value: Date) => {
            setFields((f) => {
                return { ...f, [field]: value };
            });
        };
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

        if (dateDiff(fields.start ?? editingEvent.start, fields.end ?? editingEvent.end) < 0) {
            setMessage("Event must start before it ends!");
            return;
        }

        const event: patchEventData = {
            id: editingEvent.id,
        };

        // Add to partial event if not the same.
        if (fields.name !== editingEvent.name) {
            event.name = fields.name;
        }

        if (fields.start !== editingEvent.start) {
            event.start = fields.start;
        }
        if (fields.end !== editingEvent.end) {
            event.end = fields.end;
        }

        data.patchEvent(event);
        setMessage("");
        hideForm();
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Title>Editing Event</Title>
            <Label>Name</Label>
            <Input type="text" name="name" placeholder="Name" onChange={handleChange} value={fields.name} required />
            <Label>Start</Label>
            <div>
                <DateTimePicker onChange={handleDateChange("start")} value={fields.start} required />
            </div>
            <Label>End</Label>
            <div>
                <DateTimePicker onChange={handleDateChange("end")} value={fields.end} required />
            </div>
            {message !== undefined && <div>{message}</div>}
            <ButtonSubmit type="submit">Submit</ButtonSubmit>
            <ButtonCancel onClick={hideForm}>Cancel</ButtonCancel>
        </Form>
    );
};

export default EventEdit;
