import { useEffect, useState } from "react";
import styled from "styled-components";

const Container = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    margin-top: 1rem;
    padding: 1rem 1rem;
    width: 90%;
    overflow-y: auto;
    max-height: calc(100vh - 20rem); ;
`;

const Title = styled.h1`
    font-size: 1.3rem;
    margin-bottom: 0.3rem;
`;

// TODO: InviteShape and fakeInvites are very temporary for just testing out the UI
interface InviteShape {
    id: string;
    name: string;
}

const fakeInvites: InviteShape[] = [
    {
        id: "best project",
        name: "OrgaNiUS 😎",
    },
    {
        id: "ofc its legit",
        name: "Non-shady project",
    },
    {
        id: "really long name ahead",
        name: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
    {
        id: "clone",
        name: "i'm a clone",
    },
];

const InviteContainer = styled.div``;

const InviteName = styled.span`
    max-width: 1rem;
    word-wrap: break-word;
`;

const InviteActions = styled.div`
    float: right;
`;

const InviteAction = styled.button`
    &:hover {
        color: rgb(59, 130, 246);
    }
`;

const handleAccept = (projectid: string) => {
    // TODO: make this accept
    console.log(`Accepted ${projectid}!`);
};

const handleReject = (projectid: string) => {
    // TODO: make this reject
    console.log(`Rejected ${projectid}!`);
};

const Invite = ({ project }: { project: InviteShape }): JSX.Element => {
    return (
        <InviteContainer>
            <InviteName>{project.name}</InviteName>
            <InviteActions>
                <InviteAction onClick={() => handleAccept(project.id)}>Accept</InviteAction>
                <span className="select-none">{" · "}</span>
                <InviteAction onClick={() => handleReject(project.id)}>Reject</InviteAction>
            </InviteActions>
        </InviteContainer>
    );
};

const ProjectInvites = (): JSX.Element => {
    const [invites, setInvites] = useState<InviteShape[]>([]);

    useEffect(() => {
        // TODO: seed the invites from the server
        setInvites(fakeInvites);
    }, []);

    return (
        <Container>
            <Title>Project Invites</Title>
            {invites.map((project, key) => {
                return <Invite key={key} {...{ project }} />;
            })}
        </Container>
    );
};

export default ProjectInvites;
