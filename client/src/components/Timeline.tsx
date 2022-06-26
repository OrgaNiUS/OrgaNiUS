import { useRef, useState } from "react";
import styled, { css } from "styled-components";
import { filterEvents } from "../functions/events";
import { truncate } from "../styles";
import { IEvent } from "../types";
import EventCard from "./EventCard";

const Name = styled.p`
    ${truncate}
    max-width: 10rem;
    white-space: nowrap;
`;

const ItemContainer = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    min-width: fit-content;
    position: relative;
    text-align: center;
    top: 50%;
`;

const VertLine = styled.div`
    background-color: black;
    border: none;
    height: 25px;
    position: relative;
    width: 3px;
`;

const Circle = styled.svg`
    cursor: pointer;
    transition: transform 0.2s;
    z-index: 1;

    &:hover {
        filter: brightness(150%);
        transform: scale(1.3);
    }
`;

const Item = ({ event }: { event: IEvent }): JSX.Element => {
    const [showCard, setShowCard] = useState<boolean>(false);

    const handleClick = () => {
        setShowCard((x) => !x);
    };

    const regular: string = "#3B82F6";
    // storing this colour here as comment for (potential) future usage
    // const important: string = "#FF5500";

    return (
        <ItemContainer>
            {showCard && (
                <EventCard
                    {...{
                        event,
                        position: css`
                            top: -30%;
                        `,
                    }}
                />
            )}
            <Name>{event.name}</Name>
            <Circle height="30" width="30">
                <circle cx="15" cy="15" r="15" fill={regular} onClick={handleClick} />
            </Circle>
            <VertLine />
        </ItemContainer>
    );
};

const Container = styled.div`
    bottom: 5rem;
    height: 10rem;
    margin-bottom: -5rem; /* https://stackoverflow.com/a/12601490 */
    position: relative;
`;

/* hide scrollbar from https://stackoverflow.com/a/38994837 */
const Row = styled.div`
    -ms-overflow-style: none;
    column-gap: 1rem; /* column gap specifies the minimum gap between items in the row */
    display: flex;
    height: 100%;
    justify-content: space-between;
    overflow-x: scroll;
    overflow-y: hidden;
    padding-bottom: 0.5rem;
    padding-top: 1rem;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
`;

/* user-select disabler from https://stackoverflow.com/a/4407335 */
const RowScroller = styled.div`
    -khtml-user-select: none; /* Konqueror HTML */
    -moz-user-select: none; /* Old versions of Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
    background-color: black;
    border-radius: 6px;
    color: white;
    cursor: pointer;
    padding: 0.1rem 0.3rem;
    position: absolute;
    user-select: none; /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
    z-index: 5;
`;

const RowScrollerLeft = styled(RowScroller)`
    bottom: -1rem;
`;

const RowScrollerRight = styled(RowScroller)`
    bottom: -1rem;
    right: 0;
`;

const Line = styled.hr`
    border: 2px solid black;
`;

const Timeline = ({ events }: { events: IEvent[] }): JSX.Element => {
    const filteredEvents = filterEvents(events, { over: true });

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
        <Container data-testid="timeline">
            <RowScrollerLeft onClick={() => handleScroll(true)}>{"<"}</RowScrollerLeft>
            <Row ref={rowRef}>
                {filteredEvents.map((event, i) => (
                    <Item key={i} {...{ event }} />
                ))}
            </Row>
            <RowScrollerRight onClick={() => handleScroll(false)}>{">"}</RowScrollerRight>
            <Line />
        </Container>
    );
};

export default Timeline;
