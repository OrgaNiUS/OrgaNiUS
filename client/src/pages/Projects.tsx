import { Link } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../styles";
import ProjectsList from "./ProjectsList";

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
    width: 20%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`;

const ProjectButton = styled(Button)`
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
                    {/* TODO: join project pops up a modal */}
                    <ProjectButton>Join Project</ProjectButton>
                    <ProjectButton disabled>Find Project (in the future!)</ProjectButton>
                </Buttons>
            </Container>
        </>
    );
};

export default Projects;
