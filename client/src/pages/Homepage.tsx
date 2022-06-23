import { useContext, useEffect, useState } from "react";
import styled, { css } from "styled-components";
import Scheduler from "../components/Scheduler";
import Timeline from "../components/Timeline";
import Todo from "../components/Todo";
import AuthContext from "../context/AuthProvider";
import { DataProvider } from "../context/DataProvider";
import { getCookie, setCookie } from "../functions/cookies";

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

    return (
        <DataProvider>
            <>
                <Message>Hey {auth.auth.user ? auth.auth.user : "user"}!</Message>
                <Container>
                    <Panel ratio={pageRatio}>
                        <Todo />
                    </Panel>
                    <div style={{ flex: 0.5 }}>
                        <Resizer />
                    </div>
                    <Panel ratio={10 - pageRatio}>
                        <Scheduler />
                        <Timeline />
                    </Panel>
                </Container>
            </>
        </DataProvider>
    );
};

export default Homepage;
