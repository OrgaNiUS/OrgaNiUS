import { useContext, useState } from "react";
import Scheduler from "../components/Scheduler";
import Timeline from "../components/Timeline";
import Todo from "../components/Todo";
import AuthContext from "../context/AuthProvider";
import styles from "../styles/Homepage.module.css";
import StylesMerger from "../styles/StyleMerging";

const styler = StylesMerger(styles);

// This is the component for the homepage (user dashboard).
const Homepage = (): JSX.Element => {
    const auth = useContext(AuthContext);

    // TODO: potentially save and store this in localstorage/cookie
    // pageRatio is the ratio of Left panel with regards to the entire page width
    const [pageRatio, setPageRatio] = useState<number>(3);

    return (
        <>
            <h1 className={styler("welcome-msg")}>Hey {auth.auth.user}!</h1>
            <div className={styler("container")}>
                <div style={{ flex: pageRatio }}>
                    <Todo />
                </div>
                <div>Slider</div>
                <div style={{ flex: 10 - pageRatio }}>
                    <Scheduler />
                    <Timeline />
                </div>
            </div>
        </>
    );
};

export default Homepage;
