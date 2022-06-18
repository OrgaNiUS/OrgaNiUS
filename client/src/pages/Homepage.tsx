import { useContext, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import Scheduler from "../components/Scheduler";
import Timeline from "../components/Timeline";
import Todo from "../components/Todo";
import AuthContext from "../context/AuthProvider";
import { getCookie, setCookie } from "../functions/cookies";
import { mergeEventArrays } from "../functions/events";
import { IEvent, ITask } from "../types";

// TODO: This is only for testing purposes because actual events and tasks integration are to be implemented later on.
const events: IEvent[] = [
    {
        name: "event 1",
        start: new Date(2022, 5, 1),
        end: new Date(2022, 5, 4),
    },
    {
        name: "event 2",
        start: new Date(2022, 5, 1),
        end: new Date(2022, 5, 1),
    },
    {
        name: "very loooooooooooooooooooooooooooooooooooong name",
        start: new Date(2022, 5, 1),
        end: new Date(2022, 5, 1),
    },
    {
        name: "All day event!",
        start: new Date(2022, 5, 14),
        end: new Date(2022, 5, 14),
        allDay: true,
    },
    {
        name: "Starts yesterday, ends tomorrow.",
        start: new Date(Date.now() - 1000 * 60 * 60 * 24),
        end: new Date(Date.now() + 1000 * 60 * 60 * 24),
        allDay: true,
    },
];
const tasks: ITask[] = [
    {
        id: "0",
        name: "Task 1",
        description: "This is a short description.",
        deadline: new Date(2022, 6, 12),
        isDone: false,
        tags: ["tag1", "tag2"],
    },
    {
        id: "1",
        name: "5 Days Later",
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        isDone: false,
        tags: [],
    },
    {
        id: "2",
        name: "13 Hours Later",
        description: "",
        deadline: new Date(Date.now() + 1000 * 60 * 60 * 13),
        isDone: false,
        tags: [],
    },
    {
        id: "3",
        name: "Task with only Title",
        description: "",
        isDone: false,
        tags: [],
    },
    {
        id: "4",
        name: "",
        description: "",
        isDone: false,
        tags: [],
    },
    {
        id: "5",
        name: "Task above me is empty.",
        description: "Might as well not exist, I guess.",
        isDone: false,
        tags: [],
    },
    {
        id: "6",
        name: "This task is done.",
        description: "",
        isDone: true,
        tags: [],
    },
    {
        id: "7",
        name: "This task is expired but not done.",
        description: "",
        isDone: false,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        id: "8",
        name: "This task is expired and done.",
        description: "",
        isDone: true,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        id: "9",
        name: "Really looooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong name",
        description: "",
        isDone: false,
        deadline: new Date(Date.now() - 10),
        tags: [],
    },
    {
        id: "10",
        name: "Many many tags",
        description: "Just let them flow",
        isDone: false,
        tags: ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8", "tag9", "tag10"],
    },
    {
        id: "11",
        name: "Very long word in tag",
        description: "truncate it!",
        isDone: false,
        tags: [
            "taaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaag",
        ],
    },
    {
        id: "12",
        name: "Very long word in desc",
        description:
            "truncaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaate me",
        isDone: false,
        tags: [],
    },
    // don't support something that is too ridiculously long
    {
        id: "13",
        name: "Really long description...",
        description:
            " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas placerat, purus id molestie semper, magna justo pharetra tellus, ut egestas ante est nec lectus. Aenean pretium risus sed mattis vestibulum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
        isDone: false,
        tags: [],
    },
];

const Message = styled.h1`
    font-size: 2rem;
    margin-top: 1rem;
    margin-left: 3rem;
    width: fit-content;
`;

const Container = styled.div`
    display: flex;
    height: 100%;
    padding: 1rem 3rem;
    width: 100%;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
`;

const Panel = styled.div<{ ratio: number }>`
    ${(props) => css`
        flex: ${props.ratio};
    `}

    /* not sure why this works but it works */
    width: 10%;
`;

const RContainer = styled.div`
    display: flex;
    justify-content: space-around;
    height: 100%;
`;

const RWrapper = styled.div`
    height: 100%;
`;

const RButton = styled.button`
    height: fit-content;
    position: relative;
    top: 50%;
    transform: scale(1.2);
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.6);
    }
`;

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
            <RContainer>
                <RWrapper>
                    <RButton onClick={handleRight} data-testid="resizer-left">
                        {">"}
                    </RButton>
                </RWrapper>
                <RWrapper>
                    <RButton onClick={handleLeft} data-testid="resizer-right">
                        {"<"}
                    </RButton>
                </RWrapper>
            </RContainer>
        );
    };

    const mergedEvents = mergeEventArrays(events, tasks);

    return (
        <>
            <Message data-testid="welcome-message"> Hey {auth.auth.user ? auth.auth.user : "user"}!</Message>
            <Container>
                <Panel ratio={pageRatio}>
                    <Todo {...{ initialTasks: tasks }} />
                </Panel>
                <div style={{ flex: 0.5 }}>
                    <Resizer />
                </div>
                <Panel ratio={10 - pageRatio}>
                    <Scheduler {...{ events: mergedEvents }} />
                    <Timeline {...{ events: mergedEvents }} />
                </Panel>
            </Container>
        </>
    );
};

export default Homepage;
