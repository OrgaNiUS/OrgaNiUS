import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css"; // react-big-calendar's css file
import styled from "styled-components";
import { IEvent } from "../types";

// moment is required for react-big-calendar
const localizer = momentLocalizer(moment);

const Container = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    /* 5rem from navbar, 3rem from welcome message */
    /* a further 3rem for timeline below */
    height: calc(100vh - 2 * (5rem + 1rem) - 5rem);
`;

const Scheduler = ({ events }: { events: IEvent[] }): JSX.Element => {
    const handleSelectEvent = (event: IEvent) => {
        // TODO: pop up event card
        console.log(event);
    };

    return (
        <Container>
            <Calendar
                localizer={localizer}
                events={events}
                titleAccessor="name"
                defaultView="month"
                views={["month", "week", "day"]}
                onSelectEvent={handleSelectEvent}
                drilldownView="week"
            />
        </Container>
    );
};

export default Scheduler;
