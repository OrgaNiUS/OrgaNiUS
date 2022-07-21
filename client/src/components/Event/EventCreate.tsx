import { useContext, useState } from "react";
import DateTimePicker from "react-datetime-picker";
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
    start: Date | undefined;
    end: Date | undefined;
}

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
        start: new Date(),
        end: new Date(),
    });

    const hideForm = () => {
        setShow(false);
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
            // Should not happen because required field is used.
            return;
        }

        if (fields.start === undefined || fields.end === undefined) {
            // Should not happen because required field is used.
            return;
        }

        const event: IEvent = {
            id: "", // id is irrelevant now
            name: fields.name,
            start: fields.start,
            end: fields.end,
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
            <div>
                <DateTimePicker onChange={handleDateChange("start")} value={fields.start} required />
            </div>
            <Label>End</Label>
            <div>
                <DateTimePicker onChange={handleDateChange("end")} value={fields.end} required />
            </div>
            <ButtonSubmit type="submit">Submit</ButtonSubmit>
            <ButtonCancel onClick={hideForm}>Cancel</ButtonCancel>
        </Form>
    );
};

export default EventCreate;
