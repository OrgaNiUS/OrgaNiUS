import styled from "styled-components";
import { dateDiff, isLessThan } from "../functions/dates";
import { truncate } from "../styles";
import { ITask } from "../types";

const Container = styled.div`
    margin-top: 0.5rem;
    margin-bottom: 1rem;
`;

const Name = styled.h1`
    ${truncate}
    font-size: large;
    font-weight: 600; /* only slightly bolder than default of 400 */
    white-space: nowrap; /* name should only be on one line */
`;

const Description = styled.p`
    ${truncate}
`;

const Tags = styled.p`
    ${truncate}
    opacity: 0.6;
`;

const Deadline = styled.p`
    font-size: small;
`;

const formatDate = (date: Date | undefined): string => {
    if (date === undefined) {
        return "";
    }

    // Display date in hours and days left if less than a week.
    if (isLessThan(date, 0, "")) {
        return "Expired";
    } else if (isLessThan(date, 1, "day")) {
        return `Due in ${dateDiff(new Date(), date, "hour")} hours`;
    } else if (isLessThan(date, 1, "week")) {
        return `Due in ${dateDiff(new Date(), date, "day")} days`;
    }

    const d: string = date.toLocaleDateString("en-SG");
    return `Due on ${d}`;
};

const Task = ({ task }: { task: ITask }): JSX.Element => {
    return (
        <Container>
            <Name>{task.name}</Name>
            <Description>{task.description}</Description>
            <Tags>{task.tags.map((v) => "#" + v).join(" ")}</Tags>
            <Deadline>{formatDate(task.deadline)}</Deadline>
        </Container>
    );
};

export default Task;
