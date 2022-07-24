import { useEffect, useState } from "react";
import { CreateWebSocket } from "../../api/API";

const ProjectChat = (): JSX.Element => {
    const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
    const [connectionState, setConnectionState] = useState<"loading" | "connected" | "disconnected">("loading");
    const [inputField, setInputField] = useState<string>("");
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const socket: WebSocket = CreateWebSocket("project_chat");

        socket.addEventListener("open", () => {
            setConnectionState("connected");

            console.log("connected");
        });

        socket.addEventListener("message", (event) => {
            const data = event.data;
            console.log(data);

            setMessages((m) => [...m, data]);
        });

        socket.addEventListener("close", (event) => {
            setConnectionState("disconnected");

            console.log("closed", event);
        });

        socket.addEventListener("error", (event) => {
            setConnectionState("disconnected");

            console.log("error", event);
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

        socket.send(inputField);
    };

    return (
        <div>
            <p>State: {connectionState}</p>
            <p>Messages:</p>
            {messages.map((m: string, key) => {
                return (
                    <p key={key}>
                        Message {key}: {m}
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
