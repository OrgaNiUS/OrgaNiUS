import { useContext, useState } from "react";
import styled from "styled-components";
import { EventFindCommonSlots } from "../../api/EventAPI";
import AuthContext from "../../context/AuthProvider";
import { convertMaybeISO, lastDayOfMonth } from "../../functions/dates";
import { BaseButton } from "../../styles";
import { IProject, IUser } from "../../types";
import Modal from "../Modal";

const Container = styled.div`
    text-align: center;
    width: 50vw;
`;

const Form = styled.form`
    display: inline-block;
    text-align: left;
    width: 50%;
`;

const FormDiv = styled.div`
    margin: 0.5rem 0;
`;

const Title = styled.h1`
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
`;

const NameButton = styled.span`
    cursor: pointer;

    &:hover {
        color: rgb(59, 130, 246);
    }
`;

const NumberInput = styled.input`
    border-bottom: 1px solid grey;
    color: black;
    text-align: center;
    width: 2rem; /* plays well with 2 digits */
`;

const MessageDiv = styled.div`
    padding: 0.2rem 0.5rem;

    &:not(:empty) {
        border-radius: 6px;
        border: 1px solid rgb(255, 85, 0);
    }
`;

const ButtonToggleInstructions = styled(BaseButton)`
    background-color: white;
    border: 1px solid black;
    color: black;
    margin: 0;
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

interface slotShape {
    start: Date;
    end: Date;
}

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

const Search = ({ project, hideForm }: { project: IProject; hideForm: () => void }): JSX.Element => {
    const auth = useContext(AuthContext);

    const userid: string = auth.auth.id ?? "";
    const user: IUser | undefined = project.members.find((u) => u.id === userid);
    const initialInMeeting: IUser[] = user === undefined ? [] : [user];

    const [fields, setFields] = useState<searchFields>({
        inMeeting: initialInMeeting,
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
    const [showInstructions, setShowInstructions] = useState<boolean>(false);
    const [message, setMessage] = useState<string | undefined>(undefined);

    const addToMeeting = (user: IUser) => {
        return () => {
            setFields((f) => {
                const inMeeting: IUser[] = [...f.inMeeting, user];
                return { ...f, inMeeting };
            });
        };
    };

    const removeFromMeeting = (user: IUser) => {
        return () => {
            setFields((f) => {
                const inMeeting: IUser[] = f.inMeeting.filter((u) => u.id !== user.id);
                return { ...f, inMeeting };
            });
        };
    };

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

        setMessage(undefined);
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (Object.values(fields).includes(undefined)) {
            // ensures no field contains undefined (although required field shuold let browser handle it already)
            // this is not good enough for typescript compiler, thus manually assert afterwards
            setMessage("Every field is required.");
            return;
        }

        const maximumStartDay = lastDayOfMonth(fields.dateStartMonth as number);
        if ((fields.dateStartDay as number) > maximumStartDay) {
            setMessage("Invalid starting day.");
            return;
        }

        const maximumEndDay = lastDayOfMonth(fields.dateEndMonth as number);
        if ((fields.dateEndDay as number) > maximumEndDay) {
            setMessage("Invalid ending day.");
            return;
        }

        const padNumber = (value: number | undefined): string => {
            if (value === undefined) {
                // for type checker
                return "00";
            }

            return value.toString().padStart(2, "0");
        };

        // need to pad the strings to match the correct format
        const dateStart: string = `${padNumber(fields.dateStartYear)}-${padNumber(fields.dateStartMonth)}-${padNumber(
            fields.dateStartDay
        )}`;
        const dateEnd: string = `${padNumber(fields.dateEndYear)}-${padNumber(fields.dateEndMonth)}-${padNumber(
            fields.dateEndDay
        )}`;
        const timeStart: string = `${padNumber(fields.timeStartHour)}:${padNumber(fields.timeStartMinute)}`;
        const timeEnd: string = `${padNumber(fields.timeEndHour)}:${padNumber(fields.timeEndMinute)}`;
        const duration: number = (fields.durationHour as number) * 60 + (fields.durationMinute as number);

        if (duration < 5) {
            setMessage("Minimum duration of 5 minutes.");
            return;
        }

        setMessage(undefined);

        EventFindCommonSlots(
            auth.axiosInstance,
            {
                projectid: project.id,
                userids: fields.inMeeting.map((u) => u.id),
                dateStart,
                dateEnd,
                timeStart,
                timeEnd,
                duration,
            },
            {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            },
            (response) => {
                const data = response.data;
                const slots: slotShape = data.slots.map((slot: any) => {
                    return {
                        start: convertMaybeISO(slot.start) as Date,
                        end: convertMaybeISO(slot.end) as Date,
                    };
                });

                // TODO: put this in a state
                console.log(slots);
            },
            () => {}
        );
    };

    return (
        <Container>
            <Form onSubmit={handleSubmit}>
                <Title>Arrange Meeting</Title>
                <ButtonToggleInstructions type="button" onClick={() => setShowInstructions((x) => !x)}>
                    {showInstructions ? "Hide" : "Show"} Instructions
                </ButtonToggleInstructions>
                {showInstructions && (
                    <div>
                        <p>1. Click on usernames to add/remove them from the meeting.</p>
                        <p>2. Date range is the date range to search for.</p>
                        <p>3. Time range is the time range within a day to search for.</p>
                        <p>4. Minimum duration is the minimum duration of the slot to search for.</p>
                    </div>
                )}
                <FormDiv>
                    <label>In meeting: </label>
                    {fields.inMeeting.map((u, key) => {
                        return (
                            <NameButton key={key} onClick={removeFromMeeting(u)}>
                                {/* separator */}
                                {key === 0 ? "" : " | "}
                                {u.name}
                            </NameButton>
                        );
                    })}
                </FormDiv>
                <FormDiv>
                    <label>Not in meeting: </label>
                    {project.members
                        .filter((u) => !fields.inMeeting.includes(u))
                        .map((u, key) => {
                            return (
                                <NameButton key={key} onClick={addToMeeting(u)}>
                                    {/* separator */}
                                    {key === 0 ? "" : " | "}
                                    {u.name}
                                </NameButton>
                            );
                        })}
                </FormDiv>
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
                    <label>:</label>
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
                    <label>:</label>
                    <NumberInput
                        onChange={handleChange}
                        value={fields.timeEndMinute}
                        name="timeEndMinute"
                        placeholder="mm"
                        required
                    />
                </FormDiv>
                <FormDiv>
                    <label>Minimum duration:</label>
                    <NumberInput
                        onChange={handleChange}
                        value={fields.durationHour}
                        name="durationHour"
                        placeholder="HH"
                        required
                    />
                    <label>hours, </label>
                    <NumberInput
                        onChange={handleChange}
                        value={fields.durationMinute}
                        name="durationMinute"
                        placeholder="mm"
                        required
                    />
                    <label>minutes</label>
                </FormDiv>
                <MessageDiv>{message}</MessageDiv>
                <ButtonSubmit type="submit">Search</ButtonSubmit>
                <ButtonCancel type="button" onClick={hideForm}>
                    Close
                </ButtonCancel>
            </Form>
        </Container>
    );
};

const Create = (): JSX.Element => {
    // TODO: make Create (with Selector & CreateForm)
    return <div>i am here to make this compile</div>;
};

const ArrangeMeeting = ({
    project,
    showArrangeMeeting,
    setShowArrangeMeeting,
}: {
    project: IProject;
    showArrangeMeeting: boolean;
    setShowArrangeMeeting: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
    // TODO: might need a loading state?

    // eslint-disable-next-line
    const [state, setState] = useState<"search" | "create">("search");

    const hideForm = () => {
        setShowArrangeMeeting(false);
    };

    const stateSwitch = {
        search: <Search {...{ project, hideForm }} />,
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
