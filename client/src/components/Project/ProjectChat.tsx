import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { CreateWebSocket } from "../../api/API";
import { convertMaybeISO } from "../../functions/dates";
import { BaseButton, InputCSS } from "../../styles";
import { IProject } from "../../types";

const Button = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
`;

const Container = styled.div`
    align-items: center;
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    display: flex;
    flex-direction: column;
    height: 50vh;
    justify-content: center;
    margin-top: 1rem;
    padding: 1rem;
`;

const MessagesContainer = styled.div`
    clear: both;
    height: 80%;
    overflow-y: auto;
    width: 100%;
    word-wrap: break-word;
`;

const Title = styled.h1`
    font-size: 1.5rem;
`;

const Input = styled.input`
    ${InputCSS}
    width: 75%;
`;

const ErrorDiv = styled.div`
    margin-top: 1rem;
    padding: 0.2rem 0.5rem;

    &:not(:empty) {
        border-radius: 6px;
        border: 1px solid rgb(255, 85, 0);
    }
`;

interface messageShape {
    messageType: "text" | "join";
    user: string;
    message?: string;
    joined?: boolean;
    time: Date;
}

const Message = ({ message }: { message: messageShape }): JSX.Element => {
    const timeOptions: Intl.DateTimeFormatOptions = {
        timeStyle: "short",
        hour12: false,
    };

    if (message.messageType === "text") {
        return (
            <div>
                <span>
                    {message.user}: {message.message}
                </span>
                <span className="float-right">{message.time.toLocaleTimeString("en-SG", timeOptions)}</span>
            </div>
        );
    } else if (message.messageType === "join") {
        if (message.joined === undefined) {
            return <p>Invalid Message</p>;
        }
        if (message.joined) {
            return <p>{message.user} has joined the chat.</p>;
        } else {
            return <p>{message.user} has left the chat.</p>;
        }
    }

    return <p>Invalid Message</p>;
};

const mapServerMessages = (data: string): messageShape[] => {
    const json = JSON.parse(data);
    const serverMessages: any[] = json.messages;

    const messages: messageShape[] = serverMessages.map((msg: any) => {
        const time: Date | undefined = convertMaybeISO(msg.time);
        return { ...msg, time };
    });

    return messages;
};

const ProjectChat = ({ project }: { project: IProject }): JSX.Element => {
    const [showingChat, setShowingChat] = useState<boolean>(false);
    const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
    const socketRef = useRef<WebSocket | undefined>();
    const [connectionState, setConnectionState] = useState<"loading" | "connected" | "disconnected">("loading");
    const [inputField, setInputField] = useState<string>("");
    const [messages, setMessages] = useState<messageShape[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        // maintain a reference to the socket so that can clear it on unmount
        socketRef.current = socket;
    }, [socket]);

    useEffect(() => {
        return () => {
            // unmount cycle
            const socket = socketRef.current;

            if (socket === undefined) {
                return;
            }

            socket.close();
        };
    }, []);

    const establishConnection = () => {
        if (socket !== undefined) {
            // close previous socket, if there is any
            socket.close();
        }

        setConnectionState("loading");

        const newSocket: WebSocket = CreateWebSocket("project_chat", { roomid: project.id });

        newSocket.addEventListener("open", () => {
            setConnectionState("connected");
        });

        newSocket.addEventListener("message", (event) => {
            const data = event.data;
            const parsedMessages: messageShape[] = mapServerMessages(data);

            setMessages((m) => [...m, ...parsedMessages]);
        });

        newSocket.addEventListener("close", () => {
            setConnectionState("disconnected");
        });

        newSocket.addEventListener("error", () => {
            setConnectionState("disconnected");
        });

        setSocket(newSocket);
    };

    const handleChatToggle = () => {
        setShowingChat((isActive) => {
            if (!isActive) {
                if (connectionState !== "connected") {
                    // re-establish connection if not already connected
                    establishConnection();
                }
            }
            return !isActive;
        });
    };

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();

        setInputField(event.target.value);
    };

    const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        if (socket === undefined) {
            return;
        }

        if (inputField === "") {
            setErrorMessage("Message cannot be empty!");
            return;
        }

        // from https://stackoverflow.com/a/34332105/
        const byteLength: number = new TextEncoder().encode(inputField).length;
        // maximum size of message configured on the server is 512 bytes and it will kill the connection if the message exceeds it
        if (byteLength >= 512) {
            setErrorMessage("Message too long!");
            return;
        }

        socket.send(inputField);
        setInputField("");
    };

    const stateSwitch = {
        loading: (
            <Container>
                <Title>Loading...</Title>
            </Container>
        ),
        connected: (
            <Container>
                <Title>Chat</Title>
                <MessagesContainer>
                    {messages.map((message: messageShape, key) => (
                        <Message key={key} {...{ message }} />
                    ))}
                </MessagesContainer>
                <form onSubmit={handleSubmit}>
                    <Input onChange={handleChange} value={inputField} autoFocus required />
                    <Button type="submit">Send</Button>
                </form>
                {errorMessage !== undefined && (
                    <ErrorDiv onClick={() => setErrorMessage(undefined)}>{errorMessage}</ErrorDiv>
                )}
            </Container>
        ),
        disconnected: (
            <Container>
                <Title>Disconnected!</Title>
                <Button type="button" onClick={establishConnection}>
                    Attempt Re-Connect
                </Button>
            </Container>
        ),
    };

    return (
        <>
            <Button type="button" onClick={handleChatToggle}>
                {showingChat ? "Close" : "Open"} Chat
            </Button>

            {showingChat && stateSwitch[connectionState]}
        </>
    );
};

export default ProjectChat;
