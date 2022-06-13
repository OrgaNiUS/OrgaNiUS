import StylesMerger from "../styles/StyleMerging";
import styles from "../styles/Timeline.module.css";
import { IEvent, ITask } from "../types";
import { mergeEventArrays } from "../functions/events";
import { useState } from "react";

const styler = StylesMerger(styles);

// TODO: This is only for testing purposes because actual events/tasks are to be implemented later on.
const tasks: ITask[] = [
    {
        name: "Some task",
        description: "",
        tags: [],
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
    },
    {
        name: "Another task",
        description: "",
        tags: [],
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
    },
];

const events: IEvent[] = [
    {
        name: "event 1",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 1, 1),
        important: false,
    },
    {
        name: "event 2",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 0, 1),
        important: true,
    },
    {
        name: "very loooooooooooooooooooooooooooooooooooong name",
        start: new Date(2022, 0, 1),
        end: new Date(2022, 0, 1),
        important: true,
    },
];

const Card = ({ event }: { event: IEvent }): JSX.Element => {
    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
    };

    const start: string = event.start.toLocaleDateString("en-SG", options);
    const end: string = event.end.toLocaleDateString("en-SG", options);
    const period: string = start === end ? start : `${start} - ${end}`;

    // TODO: potentially link to future events page (?)
    return (
        <div className={styler("card")}>
            <p className={styler("truncate-name")}>{event.name}</p>
            <p>{period}</p>
        </div>
    );
};

const Item = ({ event }: { event: IEvent }): JSX.Element => {
    const [showCard, setShowCard] = useState<boolean>(false);

    const handleClick = () => {
        setShowCard((x) => !x);
    };

    const regular: string = "#3B82F6";
    const important: string = "#FF5500";

    const colour: string = event.important ? important : regular;

    return (
        <div className={styler("item")}>
            {showCard && <Card {...{ event }} />}
            <div className={styler("truncate-name")}>{event.name}</div>
            <svg height="30" width="30">
                <circle cx="15" cy="15" r="15" fill={colour} className={styler("circle")} onClick={handleClick} />
            </svg>
            <div className={styler("vert-line")} />
        </div>
    );
};

// Timeline will render both events and tasks.
const Timeline = (): JSX.Element => {
    const merged = mergeEventArrays(events, tasks);
    // TODO: filter out events that are over?

    // TODO: implement buttons for scrolling timeline with
    // currently, timeline can only be scrolled by shift + scroll wheel (or touchpad)
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