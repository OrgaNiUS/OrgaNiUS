import { useRef, useState } from "react";
import StylesMerger from "../styles/StyleMerging";
import styles from "../styles/Timeline.module.css";
import { IEvent } from "../types";

const styler = StylesMerger(styles);

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
            <svg height="30" width="30" className={styler("circle")}>
                <circle cx="15" cy="15" r="15" fill={colour} onClick={handleClick} />
            </svg>
            <div className={styler("vert-line")} />
        </div>
    );
};

const Timeline = ({ events }: { events: IEvent[] }): JSX.Element => {
    // TODO: filter out events that are over?

    const rowRef = useRef<HTMLDivElement>(null);

    // Press and hold would require using setInterval.
    // Maybe implement in the future.
    const handleScroll = (left: boolean) => {
        if (rowRef.current === null) {
            return;
        }
        if (left) {
            rowRef.current.scrollLeft -= 40;
        } else {
            rowRef.current.scrollLeft += 40;
        }
    };

    return (
        <div className={styler("container")}>
            <div onClick={() => handleScroll(true)} className={styler("row-scroller", "row-scroller-left")}>
                {"<"}
            </div>
            <div className={styler("row")} ref={rowRef}>
                {events.map((event, i) => (
                    <Item key={i} {...{ event }} />
                ))}
            </div>
            <div onClick={() => handleScroll(false)} className={styler("row-scroller", "row-scroller-right")}>
                {">"}
            </div>
            <hr className={styler("line")} />
        </div>
    );
};

export default Timeline;
