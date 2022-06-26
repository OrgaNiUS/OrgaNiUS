import styled from "styled-components";
import { dateDiff, isLessThan } from "../functions/dates";
import { truncate } from "../styles";
import { ITask } from "../types";
import { todoModes } from "./Todo";

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

    const d: string = date.toLocaleDateString("en-SG");

    // Display date in hours and days left if less than a week.
    if (isLessThan(date, 0, "")) {
        return `Expired on ${d}`;
    } else if (isLessThan(date, 1, "day")) {
        return `Due in ${dateDiff(new Date(), date, "hour")} hours`;
    } else if (isLessThan(date, 1, "week")) {
        return `Due in ${dateDiff(new Date(), date, "day")} days`;
    }
    return `Due on ${d}`;
};

const Task = ({
    task,
    mode,
    checked,
    onCheck,
    setEditingTask,
}: {
    task: ITask;
    mode: todoModes;
    checked: boolean;
    onCheck: (id: string) => void;
    setEditingTask: () => void;
}): JSX.Element => {
    const handleClick = () => {
        if (mode !== "edit") {
            return;
        }
        setEditingTask();
    };

    return (
        <Container onClick={handleClick}>
            <Name>
                {(mode === "trash" || mode === "normal") && (
                    <input className="mr-1" type="checkbox" onChange={() => onCheck(task.id)} checked={checked} />
                )}
                {task.name}
            </Name>
            <Description>{task.description}</Description>
            <Tags>{task.tags.map((v) => "#" + v).join(" ")}</Tags>
            <Deadline>{formatDate(task.deadline)}</Deadline>
        </Container>
    );
};

export default Task;
