import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import styles from "../styles/Scheduler.module.css";
import StylesMerger from "../styles/StyleMerging";

// react-big-calendar's css file
import "react-big-calendar/lib/css/react-big-calendar.css";

// moment is required for react-big-calendar
const localizer = momentLocalizer(moment);
const styler = StylesMerger(styles);

const Scheduler = (): JSX.Element => {
    return (
        <div className={styler("container")}>
            <Calendar localizer={localizer} events={[]} startAccessor="start" endAccessor="end" />
        </div>
    );
};

export default Scheduler;
