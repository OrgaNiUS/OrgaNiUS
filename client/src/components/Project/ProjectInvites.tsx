import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { UserAcceptInvite, UserGetProjectInvites, UserRejectInvite } from "../../api/UserAPI";
import AuthContext from "../../context/AuthProvider";

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

type state = "no" | "accepted";
interface InviteShape {
    id: string;
    name: string;
    state: state;
}

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
}: {
    project: InviteShape;
    handleAccept: (project: InviteShape) => void;
    handleReject: (project: InviteShape) => void;
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
    const auth = useContext(AuthContext);
    const [loading, setLoading] = useState<boolean>(true);
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
        UserAcceptInvite(
            auth.axiosInstance,
            { projectid: project.id },
            () => {
                updateProjectState(project, "accepted");
            },
            () => {}
        );
    };

    const handleReject = (project: InviteShape) => {
        UserRejectInvite(
            auth.axiosInstance,
            { projectid: project.id },
            () => {
                setInvites((invites) => {
                    return invites.filter((i) => i.id !== project.id);
                });
            },
            () => {}
        );
    };

    useEffect(() => {
        UserGetProjectInvites(
            auth.axiosInstance,
            (response) => {
                const data = response.data;

                setInvites(
                    data.projects.map((proj: any) => {
                        return { ...proj, state: "no" };
                    })
                );

                setLoading(false);
            },
            () => {}
        );

        // eslint-disable-next-line
    }, []);

    const invitesSwitch = {
        loading: <div>Loading!</div>,
        ok: invites.map((project, key) => {
            return <Invite key={key} {...{ project, handleAccept, handleReject }} />;
        }),
        empty: <div>No invites found!</div>,
    };

    return (
        <Container>
            <Title>Project Invites</Title>
            {loading ? invitesSwitch.loading : invites.length === 0 ? invitesSwitch.empty : invitesSwitch.ok}
        </Container>
    );
};

export default ProjectInvites;
