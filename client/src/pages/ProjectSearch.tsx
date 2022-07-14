import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { CreateWebSocket } from "../api/API";
import PreLoader from "../components/PreLoader";
import { InputCSS } from "../styles";

/*
 * Very useful article on frontend Web Sockets.
 * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
 *
 * List of web socket error codes.
 * https://github.com/Luka967/websocket-close-codes
 */

const Container = styled.div`
    padding: 1rem 3rem;
    height: 100%;
    width: 100%;
`;

const Title = styled.h1`
    font-size: 2rem;
    margin: 1rem 0;
`;

const Input = styled.input`
    ${InputCSS};
    width: 100%;
    margin-bottom: 1rem;
`;

const ProjectsContainer = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    height: calc(100vh - 2 * (5rem + 2rem));
    padding: 1rem;
    overflow-y: auto;
`;

const ProjectCard = styled.div`
    border: 1px solid rgb(249, 115, 22);
    border-radius: 6px;
    margin-bottom: 0.5rem;
    padding: 1rem;
`;

const ProjectName = styled.div`
    cursor: pointer;
    font-size: 1.1rem;
    font-weight: 600;

    &:hover {
        color: rgb(59, 130, 246);
        text-decoration: underline;
    }
`;

interface ProjectShape {
    id: string /* projectid */;
    name: string /* name of project */;
    description: string /* description of project */;
}

const parseData = (data: any): ProjectShape[] => {
    const json = JSON.parse(data);
    const projects = json.projects;
    return projects;
};

const Project = ({
    project,
    selectProject,
}: {
    project: ProjectShape;
    selectProject: (project: ProjectShape) => void;
}): JSX.Element => {
    return (
        <ProjectCard>
            <ProjectName onClick={() => selectProject(project)}>{project.name}</ProjectName>
            <div>{project.description}</div>
        </ProjectCard>
    );
};

const socket: WebSocket = CreateWebSocket("project_search");

const ProjectSearch = (): JSX.Element => {
    const [socket, setSocket] = useState<WebSocket | undefined>(undefined);
    const [connectionState, setConnectionState] = useState<"loading" | "connected" | "disconnected">("loading");
    const [searchInput, setSearchInput] = useState<string>("");
    const [projects, setProjects] = useState<ProjectShape[]>([]);

    useEffect(() => {
        const socket: WebSocket = CreateWebSocket("project_search");

        socket.addEventListener("open", () => {
            setConnectionState("connected");
        });

        socket.addEventListener("message", (event) => {
            const projects = parseData(event.data);
            setProjects(projects);
        });

        socket.addEventListener("close", () => {
            setConnectionState("disconnected");
        });

        socket.addEventListener("error", () => {
            setConnectionState("disconnected");
        });

        setSocket(socket);
    }, []);

    const handleSearch: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setSearchInput(event.target.value);

        if (socket === undefined) {
            return;
        }
        socket.send(event.target.value);
    };

    const selectProject = (project: ProjectShape) => {
        console.log("selected", project);
    };

    if (connectionState === "loading") {
        return (
            <Container>
                <Link to="/projects">⬅️ Back to Projects</Link>
                <PreLoader {...{ loading: connectionState === "loading" }} />
            </Container>
        );
    }

    if (connectionState === "disconnected") {
        return (
            <Container>
                <Link to="/projects">⬅️ Back to Projects</Link>
                {/* TODO: render disconnect message in the middle of the screen */}
                <div>Disconnected! Please refresh the page or try again later.</div>
            </Container>
        );
    }

    return (
        <Container>
            <Link to="/projects">⬅️ Back to Projects</Link>
            <Title>Project Search</Title>
            <ProjectsContainer>
                <Input onChange={handleSearch} value={searchInput} placeholder="Search for a project..." />
                {projects.length === 0 ? (
                    <div>{searchInput === "" ? "Search something!" : "No projects found!"}</div>
                ) : (
                    projects.map((project, key) => {
                        return <Project key={key} {...{ project, selectProject }} />;
                    })
                )}
            </ProjectsContainer>
        </Container>
    );
};

export default ProjectSearch;
