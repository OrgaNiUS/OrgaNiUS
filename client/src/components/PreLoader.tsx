import { useEffect } from "react";
import styled, { keyframes, Keyframes } from "styled-components";

const Container = styled.div`
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
`;

const animationDuration: number = 3;
const loaderHeight: number = 3;
const loaderWidth: number = 9;

const BigText = styled.span`
    font-size: 2rem;
`;

const Text = styled.p``;

const Loader = styled.div`
    height: ${loaderHeight}rem;
    position: relative;
    width: ${loaderWidth}rem;
`;

// just because typing out the same thing 10 times in a row is lame.
const generateBallAnimation = () => {
    const getX = (i: number): number => {
        return Math.floor(i / 2) * 2;
    };
    const getY = (i: number): number => {
        return Math.floor((i + 1) / 2) * 0.2 * loaderHeight + 1;
    };

    const frames: string[] = [];

    for (let i = 0; i < 10; i++) {
        // going left
        const x: number = getX(i);
        const y: number = getY(i);
        const frame: string = `
                ${i * 5}% {
                    transform: translate(${x}rem, -${y}rem);
                }
            `;
        frames.push(frame);
    }

    // drop down on the right
    frames.push(`
        50% {
            transform: translate(${getX(9)}rem, -${getY(0)}rem);
        }
    `);

    for (let i = 0; i < 10; i++) {
        // going right
        const x: number = getX(9 - i);
        const y: number = getY(i);
        const frame: string = `
                ${55 + i * 5}% {
                    transform: translate(${x}rem, -${y}rem);
                }
            `;
        frames.push(frame);
    }

    // drop down on the left
    frames.push(`
        100% {
            transform: translate(${getX(0)}rem, -${getY(0)}rem);
        }
    `);

    return frames.join("\n");
};

const BallAnimate = keyframes`
    ${generateBallAnimation()}
`;

const Ball = styled.div`
    animation: ${BallAnimate} ${animationDuration * 2.5 * 0.4}s linear infinite;
    background-color: rgb(249, 115, 22);
    border-radius: 50%; /* makes it a circle */
    bottom: 0;
    height: 1rem;
    left: 0;
    position: absolute;
    width: 1rem;
`;

const BarAnimate = (index: number): Keyframes => {
    // this is looping
    const start: number = 0.2 * (index + 1);
    // end is the "mid point" of the loop
    const end: number = 0.2 * (5 - index);

    // using 40% and 90% as the actual starts because looks nicer
    return keyframes`
        0% {
            transform: scale(1, ${start})
        }
        40% {
            transform: scale(1, ${start})
        }
        50% {
            transform: scale(1, ${end})
        }
        90% {
            transform: scale(1, ${end})
        }
        100% {
            transform: scale(1, ${start})
        }
    `;
};

const Bar = styled.div<{ index: number }>`
    animation: ${(props) => BarAnimate(props.index)} ${animationDuration}s linear infinite;
    background-color: rgb(59, 130, 246);
    bottom: 0;
    height: 100%;
    left: ${(props) => props.index * 2}rem;
    position: absolute;
    transform-origin: center bottom;
    width: 1rem;
`;

// 5 seconds is the default timeout duration
const defaultTimeoutDuration: number = 1000 * 5;

/**
 * PreLoader for the website.
 *
 * Inspiration taken from "CSS Stairs Loader" from this website.
 * Code is much less hard coded than the example there.
 * https://steelkiwi.com/blog/30-most-captivating-preloaders-for-website/
 *
 * loading should initially be true and setLoading should ever only be set to false.
 * timeoutDuration is optional and defaults to 5 seconds.
 * setTimeoutObject can be used to retrieve the timeout object if needed for killing early (for whatever reason)
 */
const PreLoader = ({
    loading,
    setLoading,
    timeoutDuration,
    setTimeoutObject,
}: {
    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    timeoutDuration?: number;
    setTimeoutObject?: React.Dispatch<React.SetStateAction<NodeJS.Timeout>>;
}): JSX.Element => {
    useEffect(() => {
        const loadingTimeout: NodeJS.Timeout = setTimeout(() => {
            setLoading(false);
        }, timeoutDuration ?? defaultTimeoutDuration);

        if (setTimeoutObject !== undefined) {
            // done so that the user of this Preloader has the option to retrieve this timeout to kill it earlier if needed (using clearTimeout)
            setTimeoutObject(loadingTimeout);
        }
    }, []);

    if (!loading) {
        return (
            <Container>
                <BigText>Page or resource failed to load.</BigText>
                <Text>Check if you have permissions or try again in a while.</Text>
            </Container>
        );
    }

    return (
        <Container>
            <Loader>
                <Ball />
                {[0, 1, 2, 3, 4].map((i) => {
                    return <Bar key={i} index={i} />;
                })}
            </Loader>
            <BigText>Loading...</BigText>
        </Container>
    );
};

export default PreLoader;
