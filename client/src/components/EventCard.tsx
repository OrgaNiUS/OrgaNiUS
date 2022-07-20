import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { truncate } from "../styles";
import { IEvent } from "../types";

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

const Name = styled.p`
    ${truncate}
    max-width: 10rem;
    white-space: nowrap;
`;

const EventCard = ({ event, view }: { event: IEvent; view: "scheduler" | "timeline" }): JSX.Element => {
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
            <p>{period}</p>
        </CardContainer>
    );
};

export default EventCard;
