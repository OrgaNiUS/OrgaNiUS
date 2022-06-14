import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css"; // react-big-calendar's css file
import styles from "../styles/Scheduler.module.css";
import StylesMerger from "../styles/StyleMerging";
import { IEvent } from "../types";

// moment is required for react-big-calendar
const localizer = momentLocalizer(moment);
const styler = StylesMerger(styles);

const Scheduler = ({ events }: { events: IEvent[] }): JSX.Element => {
    const handleSelectEvent = (event: IEvent) => {
        // TODO: pop up event card
        console.log(event);
    };

    return (
        <div className={styler("container")}>
            <Calendar
                localizer={localizer}
                events={events}
                titleAccessor="name"
                defaultView="month"
                views={["month", "week", "day"]}
                onSelectEvent={handleSelectEvent}
                drilldownView="week"
            />
        </div>
    );
};

export default Scheduler;
