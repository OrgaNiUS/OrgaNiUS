import { useContext } from "react";
import styled from "styled-components";
import { dateDiff, isLessThan } from "../../functions/dates";
import { BaseButton, truncate } from "../../styles";
import { ITask } from "../../types";
import { TodoContext } from "./TodoProvider";

const Container = styled.div`
    margin-top: 0.5rem;
    margin-bottom: 1rem;
    position: relative;
`;

const TitleRow = styled.div``;

const Name = styled.span`
    ${truncate}
    font-size: large;
    font-weight: 600; /* only slightly bolder than default of 400 */
    white-space: nowrap; /* name should only be on one line */
`;

const ThreeDots = styled(BaseButton)<{ shouldFloat: boolean }>`
    ${(props) => (props.shouldFloat ? "float: right;" : "")}
    color: black;
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

const Description = styled.p`
    ${truncate}
`;

const Tags = styled.p`
    ${truncate}
    opacity: 0.6;
`;

const AssignedTo = styled.p`
    ${truncate}
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

const Task = ({ task }: { task: ITask }): JSX.Element => {
    const props = useContext(TodoContext);

    const shouldShowMenu = task.id === props.selected;
    const toggleMenu = () => {
        props.setSelected((s) => {
            if (s === task.id) {
                return "";
            }
            return task.id;
        });
    };

    const performDone: React.ChangeEventHandler<HTMLInputElement> = () => {
        props.taskDone(task);
    };

    const performEdit: React.MouseEventHandler<HTMLDivElement> = () => {
        props.taskEdit(task);
    };

    const performTrash: React.MouseEventHandler<HTMLDivElement> = () => {
        props.taskTrash(task);
    };

    return (
        <Container>
            <TitleRow>
                <input className="mr-1" type="checkbox" onChange={performDone} checked={task.isDone} />
                <Name>{task.name}</Name>
                <ThreeDots shouldFloat={props.isPersonal}>
                    <div onClick={toggleMenu}>...</div>
                    {shouldShowMenu && (
                        <ActionArray>
                            <Action onClick={performEdit}>Edit</Action>
                            <Action onClick={performTrash}>Trash</Action>
                        </ActionArray>
                    )}
                </ThreeDots>
            </TitleRow>
            <Description>{task.description}</Description>
            <Tags>{task.tags.map((v) => "#" + v).join(" ")}</Tags>
            {!props.isPersonal && (
                <AssignedTo>{"Assigned to: " + task.assignedTo.map((u) => u.name).join(", ")}</AssignedTo>
            )}
            <Deadline>{formatDate(task.deadline)}</Deadline>
        </Container>
    );
};

export default Task;
