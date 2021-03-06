import { useContext, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import EventCreate from "../components/Event/EventCreate";
import EventEdit from "../components/Event/EventEdit";
import EventIcsForm from "../components/Event/EventIcs";
import EventNusmodsForm from "../components/Event/EventNusmods";
import Modal from "../components/Modal";
import PreLoader from "../components/PreLoader";
import Scheduler from "../components/Scheduler";
import Timeline from "../components/Timeline";
import Todo from "../components/Todo/Todo";
import AuthContext from "../context/AuthProvider";
import { DataContext } from "../context/DataProvider";
import { getCookie, setCookie } from "../functions/cookies";
import { BaseButton } from "../styles";

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

const ButtonArray = styled.div`
    text-align: right;
`;

const ActionButton = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
`;

// This is the component for the homepage (user dashboard).
const Homepage = (): JSX.Element => {
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);

    // pageRatio is the ratio of Left panel with regards to the entire page width
    const pageRatioCookie: string = "dashboard-ratio";
    const pageRatioMin: number = 2;
    const pageRatioMax: number = 6;
    const [pageRatio, setPageRatio] = useState<number>(3);
    const [creatingTask, setCreatingTask] = useState<boolean>(false);
    const [showNusmods, setShowNusmods] = useState<boolean>(false);
    const [showIcs, setShowIcs] = useState<boolean>(false);

    const handleClickNusmods = () => {
        setShowNusmods((x) => !x);
        setShowIcs(false);
    };

    const handleClickIcs = () => {
        setShowIcs((x) => !x);
        setShowNusmods(false);
    };

    const handleClickCreateEvent = () => {
        setCreatingTask(true);
        setShowIcs(false);
        setShowNusmods(false);
    };

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

    if (data.loading) {
        return <PreLoader {...{ loading: data.loading }} />;
    }

    return (
        <>
            <Modal
                {...{
                    active: data.editingEvent !== undefined,
                    body: <EventEdit />,
                    callback: () => data.setEditingEvent(undefined),
                }}
            />
            <Modal
                {...{
                    active: creatingTask,
                    body: <EventCreate {...{ show: creatingTask, setShow: setCreatingTask }} />,
                    callback: () => setCreatingTask(false),
                }}
            />
            <Message>Hey {auth.auth.user ? auth.auth.user : "user"}!</Message>
            <Container>
                <Panel ratio={pageRatio}>
                    <Todo />
                </Panel>
                <div style={{ flex: 0.5 }}>
                    <Resizer />
                </div>
                <Panel ratio={10 - pageRatio}>
                    {showNusmods && <EventNusmodsForm {...{ hideForm: () => setShowNusmods(false) }} />}
                    {showIcs && <EventIcsForm {...{ hideForm: () => setShowIcs(false) }} />}
                    <ButtonArray>
                        <ActionButton onClick={handleClickIcs}>Import iCalendar (.ics) file</ActionButton>
                        <ActionButton onClick={handleClickNusmods}>Import from nusmods.com</ActionButton>
                        <ActionButton onClick={handleClickCreateEvent}>Add Event</ActionButton>
                    </ButtonArray>
                    <Scheduler />
                    <Timeline {...{ events: data.mergedEvents }} />
                </Panel>
            </Container>
        </>
    );
};

export default Homepage;
