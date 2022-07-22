import { useState } from "react";
import styled from "styled-components";
import { BaseButton } from "../../styles";
import { IUser } from "../../types";
import Modal from "../Modal";

const Form = styled.form`
    width: 50vw;
`;

const FormDiv = styled.div`
    margin: 0.5rem 0;
`;

const Title = styled.h1`
    font-size: 1.3rem;
    margin-bottom: 0.3rem;
`;

const NumberInput = styled.input`
    border-bottom: 1px solid grey;
    color: black;
    text-align: center;
    width: 2rem; /* plays well with 2 digits */
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

interface searchFields {
    inMeeting: IUser[];
    dateStartYear: number | undefined;
    dateStartMonth: number | undefined;
    dateStartDay: number | undefined;
    dateEndYear: number | undefined;
    dateEndMonth: number | undefined;
    dateEndDay: number | undefined;
    timeStartHour: number | undefined;
    timeStartMinute: number | undefined;
    timeEndHour: number | undefined;
    timeEndMinute: number | undefined;
    durationHour: number | undefined;
    durationMinute: number | undefined;
}

const yearRange: [number, number] = [0, 99];
const monthRange: [number, number] = [1, 12];
const dayRange: [number, number] = [1, 31];
const hourRange: [number, number] = [0, 23];
const minuteRange: [number, number] = [0, 59];

const ranges = {
    dateStartYear: yearRange,
    dateStartMonth: monthRange,
    dateStartDay: dayRange,
    dateEndYear: yearRange,
    dateEndMonth: monthRange,
    dateEndDay: dayRange,
    timeStartHour: hourRange,
    timeStartMinute: minuteRange,
    timeEndHour: hourRange,
    timeEndMinute: minuteRange,
    durationHour: hourRange,
    durationMinute: minuteRange,
};

// coerce the value to fall within range specified above
const coerceRange = (stringValue: string, field: keyof searchFields): number | undefined => {
    if (field === "inMeeting") {
        // should not be used for inMeeting
        return undefined;
    }

    if (stringValue === "") {
        return undefined;
    }

    const value: number = Number.parseInt(stringValue);
    if (value < 0 || Number.isNaN(value)) {
        return undefined;
    }

    const [rangeStart, rangeEnd] = ranges[field];

    if (value < rangeStart) {
        return rangeStart;
    } else if (value > rangeEnd) {
        return rangeEnd;
    }
    return value;
};

const Search = ({ hideForm }: { hideForm: () => void }): JSX.Element => {
    const [fields, setFields] = useState<searchFields>({
        inMeeting: [],
        dateStartYear: undefined,
        dateStartMonth: undefined,
        dateStartDay: undefined,
        dateEndYear: undefined,
        dateEndMonth: undefined,
        dateEndDay: undefined,
        timeStartHour: undefined,
        timeStartMinute: undefined,
        timeEndHour: undefined,
        timeEndMinute: undefined,
        durationHour: undefined,
        durationMinute: undefined,
    });

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();

        // only using this handleChange for the search fields
        // just let react crash if not true
        const field = event.target.name as keyof searchFields;
        // handle out of range values
        const value: number | undefined = coerceRange(event.target.value, field);

        setFields((f) => {
            return { ...f, [field]: value ?? "" };
        });
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        // TODO: some way to deal with invalid day (e.g. 31st of Feb)

        const dateStart: string = `${fields.dateStartYear}-${fields.dateStartMonth}-${fields.dateStartDay}`;
        const dateEnd: string = `${fields.dateEndYear}-${fields.dateEndMonth}-${fields.dateEndDay}`;
        const timeStart: string = `${fields.timeStartHour}:${fields.timeStartMinute}`;
        const timeEnd: string = `${fields.timeEndHour}:${fields.timeEndMinute}`;

        console.log(dateStart, dateEnd, timeStart, timeEnd);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Title>Arrange Meeting</Title>
            {/* TODO: write instructions here */}
            <FormDiv>
                <label>Date range: </label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.dateStartYear}
                    name="dateStartYear"
                    placeholder="YY"
                    required
                />
                <label>-</label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.dateStartMonth}
                    name="dateStartMonth"
                    placeholder="MM"
                    required
                />
                <label>-</label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.dateStartDay}
                    name="dateStartDay"
                    placeholder="DD"
                    required
                />
                <label> to </label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.dateEndYear}
                    name="dateEndYear"
                    placeholder="YY"
                    required
                />
                <label>-</label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.dateEndMonth}
                    name="dateEndMonth"
                    placeholder="MM"
                    required
                />
                <label>-</label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.dateEndDay}
                    name="dateEndDay"
                    placeholder="DD"
                    required
                />
            </FormDiv>
            <FormDiv>
                <label>Time range: </label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.timeStartHour}
                    name="timeStartHour"
                    placeholder="HH"
                    required
                />
                <label>-</label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.timeStartMinute}
                    name="timeStartMinute"
                    placeholder="mm"
                    required
                />
                <label> to </label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.timeEndHour}
                    name="timeEndHour"
                    placeholder="HH"
                    required
                />
                <label>-</label>
                <NumberInput
                    onChange={handleChange}
                    value={fields.timeEndMinute}
                    name="timeEndMinute"
                    placeholder="mm"
                    required
                />
            </FormDiv>
            <ButtonSubmit type="submit">Search</ButtonSubmit>
            <ButtonCancel type="button" onClick={hideForm}>
                Close
            </ButtonCancel>
        </Form>
    );
};

const Create = (): JSX.Element => {
    // TODO: make Create (with Selector & CreateForm)
    return <div>i am here to make this compile</div>;
};

const ArrangeMeeting = ({
    showArrangeMeeting,
    setShowArrangeMeeting,
}: {
    showArrangeMeeting: boolean;
    setShowArrangeMeeting: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
    // TODO: might need a loading state?
    const [state, _] = useState<"search" | "create">("search");

    const hideForm = () => {
        setShowArrangeMeeting(false);
    };

    const stateSwitch = {
        search: <Search {...{ hideForm }} />,
        create: <Create />,
    };

    return (
        <Modal
            {...{
                active: showArrangeMeeting,
                body: stateSwitch[state],
                callback: hideForm,
            }}
        />
    );
};

export default ArrangeMeeting;
