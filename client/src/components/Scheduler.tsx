import StylesMerger from "../styles/StyleMerging";
import styles from "../styles/Scheduler.module.css";

const styler = StylesMerger(styles);

const Scheduler = (): JSX.Element => {
    return <div className={styler("container")}></div>;
};

export default Scheduler;
