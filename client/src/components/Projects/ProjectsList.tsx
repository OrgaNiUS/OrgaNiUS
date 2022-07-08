import { useContext } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { DataContext } from "../../context/DataProvider";
import { IProjectCondensed } from "../../types";
import PreLoader from "../PreLoader";

const Container = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    /* 5rem from navbar, 3rem from welcome message */
    height: calc(100vh - 2 * (5rem + 1rem));
    overflow-y: auto;
    padding: 1rem;
`;

const ProjectCard = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(249, 115, 22);
    margin-bottom: 0.5rem;
    padding: 1rem;
`;

const ProjectName = styled.h1`
    font-size: larger;

    &:hover {
        text-decoration: underline;
        color: rgb(59, 130, 246);
    }
`;

const Project = ({ project }: { project: IProjectCondensed }): JSX.Element => {
    return (
        <ProjectCard>
            <Link to={`/project/${project.id}`}>
                <ProjectName>{project.name}</ProjectName>
            </Link>
            <div>{project.description}</div>
        </ProjectCard>
    );
};

const ProjectsList = (): JSX.Element => {
    const data = useContext(DataContext);

    if (data.loading) {
        return <PreLoader {...{ loading: data.loading }} />;
    }

    return (
        <Container>
            {data.projects.map((project, i) => {
                return <Project key={i} {...{ project }} />;
            })}
        </Container>
    );
};

export default ProjectsList;
