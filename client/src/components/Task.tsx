import { dateDiff, isLessThan } from "../functions/dates";
import StylesMerger from "../styles/StyleMerging";
import styles from "../styles/Task.module.css";
import { ITask } from "../types";

const styler = StylesMerger(styles);

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
