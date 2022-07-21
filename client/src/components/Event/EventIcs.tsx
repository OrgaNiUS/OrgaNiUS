import { useContext, useState } from "react";
import styled from "styled-components";
import { DataContext } from "../../context/DataProvider";
import { InputCSS, BaseButton } from "../../styles";

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

const EventIcsForm = ({ hideForm }: { hideForm: () => void }): JSX.Element => {
    const data = useContext(DataContext);

    const [file, setFile] = useState<File | null>(null);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        if (event.currentTarget.files === null) {
            setFile(null);
        } else {
            // only take the first file
            const file: File = event.currentTarget.files[0];
            setFile(file);
        }
    };

    const handleSubmit = () => {
        if (file === null) {
            return;
        }

        data.icsEvent(file);
        hideForm();
    };

    return (
        <Container>
            <Title>Import iCalendar File</Title>
            <input type="file" onChange={handleChange} accept="text/calendar" />
            <ButtonSubmit type="button" onClick={handleSubmit}>
                Import!
            </ButtonSubmit>
            <ButtonCancel type="button" onClick={hideForm}>
                Close
            </ButtonCancel>
        </Container>
    );
};

export default EventIcsForm;
