import { Link } from "react-router-dom";
import styled from "styled-components";
import { BaseButton } from "../styles";
import ProjectsList from "../components/Projects/ProjectsList";

const Message = styled.h1`
    font-size: 2rem;
    margin-top: 1rem;
    margin-left: 3rem;
`;

const Container = styled.div`
    display: flex;
    height: 100%;
    padding: 1rem 3rem;
    width: 100%;
    box-sizing: border-box;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
`;

const ListContainer = styled.div`
    width: 80%;
`;

const Buttons = styled.div`
    align-items: flex-end;
    display: flex;
    flex-direction: column;
    width: 20%;
`;

const ProjectButton = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
    height: 3rem;
    width: fit-content;
`;

const Projects = (): JSX.Element => {
    return (
        <>
            <Message>Your Projects</Message>
            <Container>
                <ListContainer>
                    <ProjectsList />
                </ListContainer>
                <Buttons>
                    <Link to="/project_create">
                        <ProjectButton>Create Project</ProjectButton>
                    </Link>
                    <ProjectButton disabled>Project Finder (in the future!)</ProjectButton>
                    <ProjectButton disabled>Project Invites</ProjectButton>
                </Buttons>
            </Container>
        </>
    );
};

export default Projects;
