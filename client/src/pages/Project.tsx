import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { DataContext } from "../context/DataProvider";
import { IProject } from "../types";

const Project = (): JSX.Element => {
    const data = useContext(DataContext);

    const { id } = useParams();
    const [project, setProject] = useState<IProject | undefined>(undefined);

    useEffect(() => {
        if (id === undefined) {
            return;
        }

        const project = data.getProject(id);
        setProject(project);
    }, [data, id]);

    if (project === undefined) {
        return (
            <div>
                <Link to="/projects">⬅️ Back to Project</Link>
                <div>Loading... (or you have no permissions?)</div>
            </div>
        );
    }

    return (
        <div>
            <Link to="/projects">⬅️ Back to Project</Link>
            <div>{project.name}</div>
            <div>{project.description}</div>
            <div>Members: {project.members.map((m) => m.name).join(", ")}</div>
        </div>
    );
};

export default Project;
