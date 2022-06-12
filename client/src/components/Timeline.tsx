import StylesMerger from "../styles/StyleMerging";
import styles from "../styles/Timeline.module.css";
import { IEvent, ITask } from "../types";
import { mergeEventArrays } from "../functions/events";
import { useState } from "react";

const styler = StylesMerger(styles);

// TODO: This is only for testing purposes because actual events/tasks are to be implemented later on.
const tasks: ITask[] = [
    {
        name: "some task",
        description: "",
        tags: [],
        deadline: new Date(2022, 0, 1),
    },
    {
        name: "another task",
        description: "",
        tags: [],
        deadline: new Date(2022, 0, 1),
    },
];

const events: IEvent[] = [
    {
        name: "event 1",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 0, 1),
    },
    {
        name: "event 2",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 0, 1),
    },
];

const Card = ({ event }: { event: IEvent }): JSX.Element => {
    return (
        <div className={styler("card")}>
            <p>{event.name}</p>
            <p>{event.start.toLocaleDateString("en-SG")}</p>
            <p>{event.end.toLocaleDateString("en-SG")}</p>
        </div>
    );
};

const Item = ({ event }: { event: IEvent }): JSX.Element => {
    // TODO: pop up the Card when moused over
    const [showCard, setShowCard] = useState<boolean>(false);

    const handleClick = () => {
        setShowCard((x) => !x);
    };

    // TODO: make this act like buttons (mouse pointer) and find nicer icon
    return <span onClick={handleClick}>{showCard && <Card {...{ event }} />}X</span>;
};

// Timeline will render both events and tasks.
const Timeline = (): JSX.Element => {
    const merged = mergeEventArrays(events, tasks);
    const start: Date = merged[0].start;
    const end: Date = merged[merged.length - 1].end;

    return (
        <div className={styler("container")}>
            <div className={styler("row")}>
                {merged.map((event, i) => (
                    <Item key={i} {...{ event }} />
                ))}
            </div>
            <hr className={styler("line")} />
        </div>
    );
};

export default Timeline;
