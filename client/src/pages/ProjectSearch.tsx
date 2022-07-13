import { useEffect, useState } from "react";
import { CreateWebSocket } from "../api/API";

/*
 * Very useful article on frontend Web Sockets.
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 *
 * List of web socket error codes.
 * https://github.com/Luka967/websocket-close-codes
 */

const socket: WebSocket = CreateWebSocket("project_search");

const ProjectSearch = (): JSX.Element => {
    const [field, setField] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        socket.addEventListener("open", () => {
            // TODO: stop loading here
            console.log("open");
        });

        socket.addEventListener("message", (event) => {
            console.log("message");
            console.log(`data: ${event.data}, origin: ${event.origin}, source: ${event.source}, ports: ${event.ports}`);
            const parsed = JSON.parse(event.data);
            console.log("parsed", parsed);
            setMessage(event.data);
        });

        socket.addEventListener("close", (event) => {
            console.log("close");
            console.log(event);
            console.log(`code: ${event.code}, reason: ${event.reason}, wasClean: ${event.wasClean}`);
        });

        socket.addEventListener("error", (event) => {
            console.log("error");
            console.log(event);
        });
    }, []);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setField(event.target.value);
        if (event.target.value !== "") {
            socket.send(event.target.value);
        }
    };

    const handleSubmit = () => {
        socket.send(field);
    };

    return (
        <div>
            <div>Very basic test!</div>
            <input onChange={handleChange} value={field} />
            <button onClick={handleSubmit}>Send to server!</button>
            <div>Server response: "{message}"</div>
        </div>
    );
};

export default ProjectSearch;
