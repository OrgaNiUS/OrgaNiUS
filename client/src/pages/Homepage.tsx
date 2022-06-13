import { useContext, useEffect, useState } from "react";
import Scheduler from "../components/Scheduler";
import Timeline from "../components/Timeline";
import Todo from "../components/Todo";
import AuthContext from "../context/AuthProvider";
import { getCookie, setCookie } from "../functions/cookies";
import styles from "../styles/Homepage.module.css";
import StylesMerger from "../styles/StyleMerging";

const styler = StylesMerger(styles);

// This is the component for the homepage (user dashboard).
const Homepage = (): JSX.Element => {
    const auth = useContext(AuthContext);

    // pageRatio is the ratio of Left panel with regards to the entire page width
    const pageRatioCookie: string = "dashboard-ratio";
    const pageRatioMin: number = 2;
    const pageRatioMax: number = 6;
    const [pageRatio, setPageRatio] = useState<number>(3);

    useEffect(() => {
        // on page load, load in the pageRatio from the cookies
        const ratio: string | undefined = getCookie(pageRatioCookie);
        if (ratio === undefined) {
            return;
        }
        const r: number = Number.parseInt(ratio);
        setPageRatio(Math.max(pageRatioMin, Math.min(pageRatioMax, r)));
    }, []);

    const Resizer = (): JSX.Element => {
        // tried but failed to make this draggable instead of buttons
        // might be doable with dnd-kit (or some other draggable library), which probably would be imported for tasks anyways

        const handleLeft = () => {
            setPageRatio((r) => {
                const newRatio: number = Math.max(r - 1, pageRatioMin);
                setCookie(pageRatioCookie, newRatio.toString());
                return newRatio;
            });
        };

        const handleRight = () => {
            setPageRatio((r) => {
                const newRatio: number = Math.min(r + 1, pageRatioMax);
                setCookie(pageRatioCookie, newRatio.toString());
                return newRatio;
            });
        };

        return (
            <div className={styler("resizer")}>
                <div className={styler("resizer-button-wrapper")}>
                    <button className={styler("resizer-button")} onClick={handleRight}>
                        {">"}
                    </button>
                </div>
                <div className={styler("resizer-button-wrapper")}>
                    <button className={styler("resizer-button")} onClick={handleLeft}>
                        {"<"}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <>
            <h1 className={styler("welcome-msg")}>Hey {auth.auth.user}!</h1>
            <div className={styler("container")}>
                <div className={styler("panel")} style={{ flex: pageRatio }}>
                    <Todo />
                </div>
                <div style={{ flex: 0.5 }}>
                    <Resizer />
                </div>
                <div className={styler("panel")} style={{ flex: 10 - pageRatio }}>
                    <Scheduler />
                    <Timeline />
                </div>
            </div>
        </>
    );
};

export default Homepage;
