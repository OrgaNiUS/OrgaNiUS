import { useContext, useEffect, useState } from "react";
import DateTimePicker from "react-datetime-picker";
import styled from "styled-components";
import { EventFindCommonSlots } from "../../api/EventAPI";
import AuthContext from "../../context/AuthProvider";
import { convertMaybeISO, lastDayOfMonth } from "../../functions/dates";
import { BaseButton, InputCSS } from "../../styles";
import { IEvent, IProject, IUser } from "../../types";
import Modal from "../Modal";

const Container = styled.div`
    align-items: center;
    display: flex;
    height: 50vh;
    justify-content: center;
    width: 50vw;
`;

const Form = styled.form`
    display: inline-block;
    text-align: left;
`;

const FormDiv = styled.div`
    margin: 0.5rem 0;
`;

const Title = styled.h1`
    font-size: 1.5rem;
    margin-bottom: 0.3rem;
`;

const LoadingText = styled.h1`
    font-size: 1.5rem;
    line-height: 50vh; /* same as Container's height */
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

const Panel = styled.div`
    width: 50%;
`;

const SlotsWrapper = styled.div`
    height: 80%;
    overflow-y: auto;
`;

const SlotContainer = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(249, 115, 22);
    cursor: pointer;
    margin: 0.5rem 0;
    padding: 1rem;
`;

const Input = styled.input`
    ${InputCSS}
    width: 100%;
`;

const Label = styled.label`
    float: left;
    margin-top: 0.3rem;
    width: 100%;
`;

type states = "search" | "loading" | "create";

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

const Search = ({
    project,
    hideForm,
    fields,
    setFields,
    message,
    setMessage,
    setState,
    setSlots,
}: {
    project: IProject;
    hideForm: () => void;
    fields: searchFields;
    setFields: React.Dispatch<React.SetStateAction<searchFields>>;
    message: string | undefined;
    setMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
    setState: React.Dispatch<React.SetStateAction<states>>;
    setSlots: React.Dispatch<React.SetStateAction<slotShape[]>>;
}): JSX.Element => {
    const auth = useContext(AuthContext);

    const [showInstructions, setShowInstructions] = useState<boolean>(false);

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

        // validate for wrong day like 31 Feb
        const maximumStartDay = lastDayOfMonth(fields.dateStartMonth as number);
        if ((fields.dateStartDay as number) > maximumStartDay) {
            setMessage("Invalid starting day.");
            return;
        }

        // validate for wrong day like 31 Feb
        const maximumEndDay = lastDayOfMonth(fields.dateEndMonth as number);
        if ((fields.dateEndDay as number) > maximumEndDay) {
            setMessage("Invalid ending day.");
            return;
        }

        const parseToDate = (year: number | undefined, month: number | undefined, day: number | undefined): Date => {
            if (year === undefined || month === undefined || day === undefined) {
                // for type checker
                return new Date();
            }

            // hardcode for 21st century
            return new Date(2000 + year, month, day);
        };

        // validate start <= end
        const startDate: Date = parseToDate(fields.dateStartYear, fields.dateStartMonth, fields.dateStartDay);
        const endDate: Date = parseToDate(fields.dateEndYear, fields.dateEndMonth, fields.dateEndDay);

        if (startDate > endDate) {
            setMessage("Date cannot end before it starts.");
            return;
        }

        const startTime: number = (fields.timeStartHour as number) * 60 + (fields.timeStartMinute as number);
        const endTime: number = (fields.timeEndHour as number) * 60 + (fields.timeEndMinute as number);
        if (startTime > endTime) {
            setMessage("Time cannot end before it starts.");
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
        setState("loading");

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
                const slots: slotShape[] = data.slots.map((slot: any) => {
                    return {
                        start: convertMaybeISO(slot.start) as Date,
                        end: convertMaybeISO(slot.end) as Date,
                    };
                });

                setSlots(slots);
                setState("create");
                setMessage(undefined);
            },
            () => {
                setMessage("Something went wrong!");
                setState("search");
            }
        );
    };

    return (
        <Container>
            <Form className="w-2/4" onSubmit={handleSubmit}>
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

const Loading = (): JSX.Element => {
    return (
        <Container>
            <LoadingText>Loading!</LoadingText>
        </Container>
    );
};

const formatDate = (slot: slotShape): string => {
    // renders like this
    // Monday, 8 August 2022, 10:00 to 14:00
    const dateOptions: Intl.DateTimeFormatOptions = {
        dateStyle: "full",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        timeStyle: "short",
        hour12: false,
    };

    const date: string = slot.start.toLocaleDateString("en-SG", dateOptions);
    const startTime: string = slot.start.toLocaleTimeString("en-SG", timeOptions);
    const endTime: string = slot.end.toLocaleTimeString("en-SG", timeOptions);

    return `${date}, ${startTime} to ${endTime}`;
};

const Selector = ({
    slots,
    setSelection,
    setState,
}: {
    slots: slotShape[];
    setSelection: React.Dispatch<React.SetStateAction<slotShape | undefined>>;
    setState: React.Dispatch<React.SetStateAction<states>>;
}): JSX.Element => {
    return (
        <Panel className="h-full">
            <Title>Select a Slot</Title>
            <p>Select something, then edit on the right.</p>
            <SlotsWrapper>
                {slots.length === 0 ? (
                    <SlotContainer onClick={() => setState("search")}>
                        None found, click to change search parameters!
                    </SlotContainer>
                ) : (
                    slots.map((s, key) => {
                        return (
                            <SlotContainer key={key} onClick={() => setSelection(s)}>
                                {formatDate(s)}
                            </SlotContainer>
                        );
                    })
                )}
            </SlotsWrapper>
        </Panel>
    );
};

interface createFields {
    name: string;
    start: Date | undefined;
    end: Date | undefined;
}

const emptyCreateFields: createFields = {
    name: "",
    start: undefined,
    end: undefined,
};

const CreateForm = ({
    hideForm,
    selection,
    message,
    setMessage,
    setState,
    createEvent,
}: {
    hideForm: () => void;
    selection: slotShape | undefined;
    message: string | undefined;
    setMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
    setState: React.Dispatch<React.SetStateAction<states>>;
    createEvent: (event: IEvent | undefined) => void;
}): JSX.Element => {
    const [fields, setFields] = useState<createFields>(emptyCreateFields);

    useEffect(() => {
        // when selection changes, update the details in the form

        if (selection === undefined) {
            // initial page load, don't do anything
            return;
        }

        setFields((f) => {
            return { ...f, start: selection.start, end: selection.end };
        });
    }, [selection]);

    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = (e) => {
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
        e.preventDefault();

        // assert the fields are not empty (also ensured on html level via required)
        if (fields.name === "") {
            setMessage("Name must not be empty.");
            return;
        } else if (fields.start === undefined || fields.end === undefined) {
            setMessage("Start and end must not be empty.");
            return;
        }

        if (fields.start > fields.end) {
            setMessage("Date cannot end before it starts.");
            return;
        }
        if (fields.start < new Date()) {
            setMessage("Cannot create event before now.");
            return;
        }

        const event: IEvent = {
            id: "" /* placeholder */,
            name: fields.name,
            start: fields.start,
            end: fields.end,
        };

        createEvent(event);
        hideForm();
        setMessage(undefined);
        setFields(emptyCreateFields);
    };

    return (
        <Panel>
            <Form onSubmit={handleSubmit}>
                <Title>Create Meeting</Title>
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
                    <DateTimePicker
                        className="w-full"
                        onChange={handleDateChange("start")}
                        value={fields.start}
                        required
                    />
                </div>
                <Label>End</Label>
                <div>
                    <DateTimePicker className="w-full" onChange={handleDateChange("end")} value={fields.end} required />
                </div>
                <MessageDiv>{message}</MessageDiv>
                <ButtonSubmit type="submit">Create</ButtonSubmit>
                <ButtonCancel onClick={hideForm}>Close</ButtonCancel>
                <ButtonCancel onClick={() => setState("search")}>Back to Search</ButtonCancel>
            </Form>
        </Panel>
    );
};

const Create = ({
    hideForm,
    slots,
    message,
    setMessage,
    setState,
    createEvent,
}: {
    hideForm: () => void;
    slots: slotShape[];
    message: string | undefined;
    setMessage: React.Dispatch<React.SetStateAction<string | undefined>>;
    setState: React.Dispatch<React.SetStateAction<states>>;
    createEvent: (event: IEvent | undefined) => void;
}): JSX.Element => {
    const [selection, setSelection] = useState<slotShape | undefined>(undefined);

    return (
        <Container>
            <Selector {...{ slots, setSelection, setState }} />
            <CreateForm {...{ hideForm, selection, message, setMessage, setState, createEvent }} />
        </Container>
    );
};

const ArrangeMeeting = ({
    project,
    showArrangeMeeting,
    setShowArrangeMeeting,
    createEvent,
}: {
    project: IProject;
    showArrangeMeeting: boolean;
    setShowArrangeMeeting: React.Dispatch<React.SetStateAction<boolean>>;
    createEvent: (event: IEvent | undefined) => void;
}): JSX.Element => {
    const auth = useContext(AuthContext);

    const userid: string = auth.auth.id ?? "";
    const user: IUser | undefined = project.members.find((u) => u.id === userid);
    const initialInMeeting: IUser[] = user === undefined ? [] : [user];

    // moved search field & message here so that it is preserved across states
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
    const [message, setMessage] = useState<string | undefined>(undefined);

    const [state, setState] = useState<states>("search");
    const [slots, setSlots] = useState<slotShape[]>([]);

    const hideForm = () => {
        setShowArrangeMeeting(false);
    };

    const stateSwitch = {
        search: <Search {...{ project, hideForm, fields, setFields, message, setMessage, setState, setSlots }} />,
        loading: <Loading />,
        create: <Create {...{ hideForm, slots, message, setMessage, setState, createEvent }} />,
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
