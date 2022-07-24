import { useState } from "react";
import { CreateWebSocket } from "../../api/API";
import { convertMaybeISO } from "../../functions/dates";

interface messageShape {
    messageType: "text" | "join";
    user: string;
    message?: string;
    joined?: boolean;
    time: Date;
}

const mapServerMessages = (data: string): messageShape[] => {
    const json = JSON.parse(data);
    const serverMessages: any[] = json.messages;

    const messages: messageShape[] = serverMessages.map((msg: any) => {
        const time: Date | undefined = convertMaybeISO(msg.start);
        return { ...msg, time };
    });

    return messages;
};

const ProjectChat = (): JSX.Element => {
    const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
    const [connectionState, setConnectionState] = useState<"loading" | "connected" | "disconnected">("loading");
    const [inputField, setInputField] = useState<string>("");
    const [messages, setMessages] = useState<messageShape[]>([]);

    // TODO: get from project page (ofc lol)
    const [projectid, setProjectid] = useState<string>("");

    const establishConnection = () => {
        if (socket !== undefined) {
            // close previous socket, if there is any
            socket.close();
        }

        const newSocket: WebSocket = CreateWebSocket("project_chat", { chatid: projectid });

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

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();

        setInputField(event.target.value);
    };

    const handleSubmit = () => {
        if (socket === undefined) {
            return;
        }

        if (inputField === "") {
            // TODO: show error message
            return;
        }

        // from https://stackoverflow.com/a/34332105/
        const byteLength: number = new TextEncoder().encode(inputField).length;
        // maximum size of message configured on the server is 512 bytes and it will kill the connection if the message exceeds it
        if (byteLength >= 512) {
            // TODO: show error message
            return;
        }

        socket.send(inputField);
        setInputField("");
    };

    return (
        // TODO: UI
        <div>
            <p>State: {connectionState}</p>
            <p>Messages:</p>
            {messages.map((m: messageShape, key) => {
                return (
                    <p key={key}>
                        {m.user}: {m.message}
                    </p>
                );
            })}
            <input
                onChange={(event) => {
                    event.preventDefault();
                    setProjectid(event.target.value);
                }}
                value={projectid}
                autoFocus
            />
            <button type="button" onClick={establishConnection}>
                Connect to Server
            </button>
            {/* TODO: give this autoFocus back in project page */}
            <input onChange={handleChange} value={inputField} required />
            <button type="button" onClick={handleSubmit}>
                Send
            </button>
        </div>
    );
};

export default ProjectChat;
