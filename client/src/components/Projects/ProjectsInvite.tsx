import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { CreateWebSocket } from "../../api/API";
import { ProjectInvite } from "../../api/ProjectAPI";
import AuthContext from "../../context/AuthProvider";
import { BaseButton, InputCSS } from "../../styles";

const Container = styled.div`
    background-color: white;
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    max-height: 40%;
    overflow-y: auto;
    padding: 1rem 1rem;
    position: absolute;
    right: 4rem;
    top: 10rem;
    width: 20%;
    z-index: 50;
`;

const Title = styled.h1`
    font-size: 1.3rem;
    margin-bottom: 0.3rem;
`;

const Input = styled.input`
    ${InputCSS}
    width: 85%;
`;

const IconButton = styled.button`
    &:hover {
        color: rgb(59, 130, 246);
    }
`;

const ButtonSubmit = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
    float: right;
`;

const ButtonCancel = styled(BaseButton)`
    background-color: white;
    border: 1px solid black;
    color: black;
    float: right;
`;

interface SuggestionShape {
    id: string;
    name: string;
}

const parseData = (data: any): SuggestionShape[] => {
    const json = JSON.parse(data);
    const projects = json.users;
    return projects;
};

/**
 * For clarity, this is the invitation panel for a admin of a project to invite other users.
 */
const ProjectsInvite = ({
    projectid,
    setShowInviteWindow,
}: {
    projectid: string;
    setShowInviteWindow: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
    const auth = useContext(AuthContext);
    const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
    const [connectionState, setConnectionState] = useState<"loading" | "connected" | "disconnected">("loading");
    const [suggestions, setSuggestions] = useState<SuggestionShape[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [field, setField] = useState<string>("");

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();

        setField(event.target.value);

        if (socket === undefined) {
            return;
        }
        const payload = {
            projectid: projectid,
            query: event.target.value,
        };
        socket.send(JSON.stringify(payload));
    };

    const handleAdd = (name: string) => {
        setSelected((invs) => [...invs, name]);

        setField("");
        setSuggestions([]);
    };

    const handleRemove = (name: string) => {
        setSelected((invs) => invs.filter((inv) => inv !== name));
    };

    const handleClose = () => {
        setShowInviteWindow(false);
    };

    const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();

        if (selected.length === 0) {
            // if nothing selected yet, assume the user clicked this by accident, so don't do anyhing
            return;
        }

        ProjectInvite(
            auth.axiosInstance,
            { users: selected, projectid },
            () => {
                setSelected([]);
                handleClose();
            },
            () => {}
        );
    };

    const setupSocket = () => {
        setConnectionState("loading");

        const socket: WebSocket = CreateWebSocket("project_invite_search");

        socket.addEventListener("open", () => {
            setConnectionState("connected");
        });

        socket.addEventListener("message", (event) => {
            const suggestions = parseData(event.data);
            setSuggestions(suggestions);
        });

        socket.addEventListener("close", () => {
            setConnectionState("disconnected");
        });

        socket.addEventListener("error", () => {
            setConnectionState("disconnected");
        });

        setSocket(socket);
    };

    useEffect(() => {
        setupSocket();
    }, []);

    if (connectionState === "loading") {
        return (
            <Container>
                <Title>Invite members...</Title>
                <div>Loading...</div>
            </Container>
        );
    }

    if (connectionState === "disconnected") {
        return (
            <Container>
                <Title>Invite members...</Title>
                <div>Disconnected!</div>
                <ButtonSubmit onClick={setupSocket}>Attempt Re-Connect</ButtonSubmit>
            </Container>
        );
    }

    return (
        <Container>
            <Title>Invite members...</Title>
            <form onSubmit={(event) => event.preventDefault()}>
                <div className="relative my-2">
                    <Input onChange={handleChange} value={field} placeholder="Enter a name..." autoFocus />
                    {suggestions
                        // filter out those already selected
                        .filter((sug) => !selected.includes(sug.name))
                        .map((suggestion, key) => {
                            return (
                                <div key={key} className="pl-2">
                                    <span>{suggestion.name}</span>
                                    <IconButton className="float-right" onClick={() => handleAdd(suggestion.name)}>
                                        {/* plus from https://heroicons.com/ */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                        </svg>
                                    </IconButton>
                                </div>
                            );
                        })}
                </div>
                <div>
                    {selected.map((invite, key) => {
                        return (
                            <div key={key} className="pl-2">
                                <span>{invite}</span>
                                <IconButton className="float-right" onClick={() => handleRemove(invite)}>
                                    {/* minus from https://heroicons.com/ */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                    </svg>
                                </IconButton>
                            </div>
                        );
                    })}
                </div>
                <ButtonSubmit type="button" onClick={handleSubmit}>
                    Send Invites!
                </ButtonSubmit>
                <ButtonCancel type="button" onClick={handleClose}>
                    Close
                </ButtonCancel>
            </form>
        </Container>
    );
};

export default ProjectsInvite;
