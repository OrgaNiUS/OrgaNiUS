import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
type state = "no" | "accepted" | "rejected";
interface InviteShape {
    id: string;
    name: string;
    state: state;
}

const fakeInvites: InviteShape[] = [
    {
        id: "best project",
        name: "OrgaNiUS 😎",
        state: "no",
    },
    {
        id: "ofc its legit",
        name: "Non-shady project",
        state: "no",
    },
    {
        id: "really long name ahead",
        name: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
    },
    {
        id: "clone",
        name: "i'm a clone",
        state: "no",
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

const Invite = ({
    project,
    handleAccept,
    handleReject,
    handleUndo,
}: {
    project: InviteShape;
    handleAccept: (project: InviteShape) => void;
    handleReject: (project: InviteShape) => void;
    handleUndo: (project: InviteShape) => void;
}): JSX.Element => {
    const actions = {
        no: (
            <>
                <InviteAction onClick={() => handleAccept(project)}>Accept</InviteAction>
                <span className="select-none">{" · "}</span>
                <InviteAction onClick={() => handleReject(project)}>Reject</InviteAction>
            </>
        ),
        accepted: (
            <InviteAction>
                <Link to={`/project/${project.id}`}>Go to Project</Link>
            </InviteAction>
        ),
        rejected: <InviteAction onClick={() => handleUndo(project)}>Undo...</InviteAction>,
    };

    return (
        <InviteContainer>
            <InviteName>{project.name}</InviteName>
            <InviteActions>{actions[project.state]}</InviteActions>
        </InviteContainer>
    );
};

/**
 * For clarity, this is the invites panel for a user to accept/decline invites.
 */
const ProjectInvites = (): JSX.Element => {
    const [invites, setInvites] = useState<InviteShape[]>([]);

    // abstracted out because similar code
    const updateProjectState = (project: InviteShape, state: state) => {
        setInvites((invites) => {
            const invitesCopy: InviteShape[] = [...invites];
            for (let i = 0; i < invites.length; i++) {
                if (invitesCopy[i].id !== project.id) {
                    continue;
                }
                invitesCopy[i] = {
                    ...invitesCopy[i],
                    state,
                };
                break;
            }
            return invitesCopy;
        });
    };

    const handleAccept = (project: InviteShape) => {
        updateProjectState(project, "accepted");

        // TODO: send to server
    };

    const handleReject = (project: InviteShape) => {
        updateProjectState(project, "rejected");

        // TODO: send to server
    };

    const handleUndo = (project: InviteShape) => {
        updateProjectState(project, "no");
    };

    useEffect(() => {
        // TODO: seed the invites from the server
        setInvites(fakeInvites);
    }, []);

    return (
        <Container>
            <Title>Project Invites</Title>
            {invites.map((project, key) => {
                return <Invite key={key} {...{ project, handleAccept, handleReject, handleUndo }} />;
            })}
        </Container>
    );
};

export default ProjectInvites;
