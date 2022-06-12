import StylesMerger from "../styles/StyleMerging";
import styles from "../styles/Task.module.css";
import { ITask } from "../types";

const styler = StylesMerger(styles);

const formatDate = (date: Date | undefined): string => {
    if (date === undefined) {
        return "";
    }

    // thresholds are in milliseconds
    const milliInHour = 1000 * 60 * 60;
    const dayThreshold: number = milliInHour * 24;
    const weekThreshold: number = dayThreshold * 7;

    const diff: number = date.getTime() - Date.now();

    // Display date in hours and days left if less than a week.
    if (diff < dayThreshold) {
        const hours: number = diff / milliInHour;
        return `Due in ${Math.round(hours)} hours`;
    } else if (diff < weekThreshold) {
        const days: number = diff / (milliInHour * 24);
        return `Due in ${Math.round(days)} days`;
    }

    const d: string = date.toLocaleDateString("en-SG");
    return `Due on ${d}`;
};

// TODO: Some way to deal with long name and description and tags.

const Task = ({ task }: { task: ITask }): JSX.Element => {
    return (
        <div className={styler("container")}>
            <h1 className={styler("name")}>{task.name}</h1>
            <p className={styler("desc")}>{task.description}</p>
            <p className={styler("tags")}>{task.tags.map((v) => "#" + v).join(" ")}</p>
            <p className={styler("deadline")}>{formatDate(task.deadline)}</p>
        </div>
    );
};

export default Task;
