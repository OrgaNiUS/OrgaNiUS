import { useContext } from "react";
import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { DataContext } from "../../context/DataProvider";
import { BaseButton, truncate } from "../../styles";
import { IEvent } from "../../types";

const CardContainer = styled.div<{ custom: FlattenSimpleInterpolation }>`
    ${(props) => props.custom}
    background-color: white;
    border-radius: 5px;
    border: 2px solid black;
    box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
    padding: 0.2rem 0.6rem;
    position: absolute;
    width: max-content;
`;

const Name = styled.span`
    ${truncate}
    max-width: 10rem;
    white-space: nowrap;
`;

const ThreeDots = styled(BaseButton)`
    color: black;
    float: right;
    line-height: 1rem;
    position: relative;
`;

const ActionArray = styled.div`
    background-color: white;
    border-radius: 8px;
    border: 1px solid rgb(249, 115, 22);
    padding: 0.5rem 1rem;
    position: absolute;
    right: 0;
    text-align: right;
    z-index: 10;
`;

const Action = styled.div`
    cursor: pointer;
`;

const EventCard = ({ event, view }: { event: IEvent; view: "scheduler" | "timeline" }): JSX.Element => {
    const data = useContext(DataContext);

    const toggleMenu = () => {
        data.setSelectedEvent((s) => {
            if (s === event.id) {
                return undefined;
            }
            return event.id;
        });
    };

    const performEdit: React.MouseEventHandler<HTMLDivElement> = () => {
        data.setEditingEvent(event);
        data.setSelectedEvent(undefined);
    };

    const performTrash: React.MouseEventHandler<HTMLDivElement> = () => {
        // TODO: delete event
        data.setSelectedEvent(undefined);
    };

    const options: Intl.DateTimeFormatOptions = {
        day: "numeric",
        month: "short",
    };

    const start: string = event.start.toLocaleDateString("en-SG", options);
    const end: string = event.end.toLocaleDateString("en-SG", options);
    const period: string = start === end ? start : `${start} - ${end}`;

    const position = {
        scheduler: css`
            right: 2rem;
            top: 5rem;
            z-index: 5;
        `,
        timeline: css`
            top: -30%;
        `,
    };

    return (
        <CardContainer custom={position[view]}>
            <Name>{event.name}</Name>
            <ThreeDots>
                <div onClick={toggleMenu}>...</div>
                {event.id === data.selectedEvent && (
                    <ActionArray>
                        <Action onClick={performEdit}>Edit</Action>
                        <Action onClick={performTrash}>Trash</Action>
                    </ActionArray>
                )}
            </ThreeDots>
            <p>{period}</p>
        </CardContainer>
    );
};

export default EventCard;
