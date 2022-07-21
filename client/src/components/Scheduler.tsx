import moment from "moment";
import { useContext, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css"; // react-big-calendar's css file
import styled from "styled-components";
import { DataContext } from "../context/DataProvider";
import { DateItem } from "../types";
import EventCard from "./Event/EventCard";

// moment is required for react-big-calendar
const localizer = momentLocalizer(moment);

const Container = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    /* 5rem from navbar, 3rem from welcome message */
    /* a further 3rem for timeline below */
    height: calc(100vh - 18.5rem);
    position: relative;
`;

const intervalDuration: number = 1000 * 5;

const Scheduler = (): JSX.Element => {
    const data = useContext(DataContext);

    const [currentInterval, setCurrentInterval] = useState<NodeJS.Timer | null>(null);
    const [eventCard, setEventCard] = useState<DateItem | null>(null);

    const handleSelectEvent = (event: DateItem) => {
        setEventCard(event);

        if (currentInterval !== null) {
            // clear current interval (if there is one)
            // so that there is only 1 interval active at any point in time
            clearInterval(currentInterval);
        }

        const interval = setInterval(() => {
            setEventCard(null);
        }, intervalDuration);

        setCurrentInterval(interval);
    };

    return (
        <Container>
            {eventCard !== null && <EventCard {...{ event: eventCard, view: "scheduler" }} />}
            <Calendar
                localizer={localizer}
                events={data.mergedEvents}
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
