import { useContext, useState } from "react";
import styled from "styled-components";
import { DataContext } from "../../context/DataProvider";
import { BaseButton, InputCSS } from "../../styles";

const Container = styled.div`
    background-color: white;
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    max-height: 40%;
    overflow-y: auto;
    padding: 1rem 1rem;
    position: absolute;
    right: 4rem;
    top: 12.5rem;
    width: 20%;
    z-index: 50;
`;

const Title = styled.h1`
    font-size: 1.3rem;
    margin-bottom: 0.3rem;
`;

const Input = styled.input`
    width: 100%;
    ${InputCSS}
`;

const ButtonSubmit = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
    float: right;
`;

const ButtonCancel = styled(BaseButton)`
    background-color: white;
    border: 1px solid black;
    color: black;
    float: right;
`;

const EventNusmodsForm = ({ hideForm }: { hideForm: () => void }): JSX.Element => {
    const data = useContext(DataContext);

    const [field, setField] = useState<string>("");

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();

        setField(event.target.value);
    };

    const handleSubmit = () => {
        // stole regex from nusmods.go (& tweaked to Javascript flavour)
        if (!field.match(/https?:\/\/nusmods\.com\/timetable\/sem-[12]\/share\?.*/)) {
            console.log("BAD INPUT!!!!");
            return;
        }

        data.nusmodsEvent(field);
        hideForm();
    };

    return (
        <Container>
            <Title>Import timetable from nusmods.com</Title>
            <Input
                onChange={handleChange}
                value={field}
                placeholder="https://nusmods.com/timetable/sem-1/share?..."
                autoFocus
            />
            <ButtonSubmit type="button" onClick={handleSubmit}>
                Send Invites!
            </ButtonSubmit>
            <ButtonCancel type="button" onClick={hideForm}>
                Close
            </ButtonCancel>
        </Container>
    );
};

export default EventNusmodsForm;
