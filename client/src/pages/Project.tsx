import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DataContext } from "../context/DataProvider";
import { IProject } from "../types";

const Project = (): JSX.Element => {
    const data = useContext(DataContext);

    const { id } = useParams();
    // Simple O(n) for now, potentially use objects for O(1).
    const initialProject = data.projects.find((project) => project.id === id);
    const [project, setProject] = useState<IProject | undefined>(initialProject);

    useEffect(() => {
        // TODO: get from server and update project
    }, []);

    if (project === undefined) {
        return (
            <div>
                <Link to="/projects">{"<- Back to projects"}</Link>
                <div>Loading... (or you have no permissions?)</div>
            </div>
        );
    }

    return (
        <div>
            <Link to="/projects">{"<- Back to projects"}</Link>
            <div>{project.name}</div>
            <div>{project.description}</div>
            <div>Members: {project.members.map((m) => m.name).join(", ")}</div>
        </div>
    );
};

export default Project;
