import { useEffect, useState } from "react";
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

    useEffect(() => {
        const socket: WebSocket = CreateWebSocket("project_chat");

        socket.addEventListener("open", () => {
            setConnectionState("connected");
        });

        socket.addEventListener("message", (event) => {
            const data = event.data;
            const parsedMessages: messageShape[] = mapServerMessages(data);

            setMessages((m) => [...m, ...parsedMessages]);
        });

        socket.addEventListener("close", () => {
            setConnectionState("disconnected");
        });

        socket.addEventListener("error", () => {
            setConnectionState("disconnected");
        });

        setSocket(socket);
    }, []);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();

        setInputField(event.target.value);
    };

    const handleSubmit = () => {
        if (socket === undefined) {
            return;
        }

        // TODO: check for string that is too long (& stop it, because otherwise server will kill connection! :D)
        // https://stackoverflow.com/a/34332105/
        socket.send(inputField);
        setInputField("");
    };

    return (
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
            <input onChange={handleChange} value={inputField} autoFocus />
            <button type="button" onClick={handleSubmit}>
                Send
            </button>
        </div>
    );
};

export default ProjectChat;
