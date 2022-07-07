import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { BaseButton, IconButton } from "../../styles";
import { IUser } from "../../types";

const Container = styled.div`
    padding: 1rem 3rem;
    height: 100%;
    width: 100%;
`;

const Row = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
`;

const Title = styled.h1`
    font-size: 2rem;
    margin: 1rem 0;
`;

const ButtonSubmit = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
    font-size: 1.3rem;
`;

const ApplicationsContainer = styled.div`
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    height: calc(100vh - 2 * (5rem + 2rem));
    padding: 1rem;
    overflow-y: auto;
`;

const ApplicationCard = styled.div<{ state: state }>`
    ${(props) => {
        if (props.state === "no") {
            return `
                border: 1px solid rgb(249, 115, 22);
            `;
        } else if (props.state === "accepted") {
            return `
                border: 1px solid rgb(13, 198, 3);
            `;
        } else if (props.state === "rejected") {
            return `
                opacity: 50%;
                border: 1px solid #ff0000;
                `;
        }
        return "";
    }}

    border-radius: 6px;
    margin-bottom: 0.5rem;
    padding: 1rem;
`;

const ApplicationName = styled.span`
    font-weight: 600;
    font-size: 1.1rem;
`;

const ApplicationButton = styled(IconButton)`
    margin-right: 0.5rem;
`;

// TODO: ApplicationShape and fakeApplications are very temporary for just testing out the UI
interface DataShape {
    id: string /* id of project */;
    name: string /* name of project */;
    applications: ApplicationShape[];
}

type state = "no" | "accepted" | "rejected";
interface ApplicationShape extends IUser {
    description: string;
    state: state;
}

const fakeApplications: ApplicationShape[] = [
    {
        id: "0",
        name: "bad applicant",
        description: "reject me pls",
        state: "no",
    },
    {
        id: "1",
        name: "good applicant",
        description: "accept me pls",
        state: "no",
    },
    {
        id: "2",
        name: "SirLikesToTypeALot",
        description:
            "who makes names this long anyways? what's their problem, causing problems for people designing UI. they should really reconsider long usernames, or maybe we should be the ones considering limiting their username lengths, or maybe it is just good practice to handle long names evne if its not actually possible, I know I made a typo a few words back but I don't intend to go back and fix it, I'm sorry! but I hope this amount of text is now long enough for testing. done",
        state: "no",
    },
    {
        id: "3",
        name: "clones are getting out of hand now",
        description: "",
        state: "no",
    },
    {
        id: "3",
        name: "clones are getting out of hand now",
        description: "",
        state: "no",
    },
    {
        id: "3",
        name: "clones are getting out of hand now",
        description: "",
        state: "no",
    },
    {
        id: "3",
        name: "clones are getting out of hand now",
        description: "",
        state: "no",
    },
    {
        id: "3",
        name: "clones are getting out of hand now",
        description: "",
        state: "no",
    },
    {
        id: "3",
        name: "clones are getting out of hand now",
        description: "",
        state: "no",
    },
];

const Application = ({
    application,
    handleAccept,
    handleReject,
}: {
    application: ApplicationShape;
    handleAccept: (application: ApplicationShape) => void;
    handleReject: (application: ApplicationShape) => void;
}): JSX.Element => {
    return (
        <ApplicationCard state={application.state}>
            <div>
                <ApplicationButton type="button" onClick={() => handleAccept(application)}>
                    ✅
                </ApplicationButton>
                <ApplicationButton type="button" onClick={() => handleReject(application)}>
                    ❌
                </ApplicationButton>
                <ApplicationName>{application.name}</ApplicationName>
            </div>
            <div>{application.description}</div>
        </ApplicationCard>
    );
};

const ProjectApplications = (): JSX.Element => {
    const [pageData, setPageData] = useState<DataShape | undefined>(undefined);
    const { id: projectid } = useParams();

    useEffect(() => {
        // TODO: seed data properly

        setPageData({
            id: projectid ?? "WHY NO ID",
            name: "Test Project!",
            applications: fakeApplications,
        });

        // eslint-disable-next-line
    }, []);

    // abstracted out because similar code
    const updateApplicationState = (application: ApplicationShape, state: state) => {
        setPageData((data) => {
            if (data === undefined) {
                return undefined;
            }

            const applications: ApplicationShape[] = [...data.applications];
            for (let i = 0; i < applications.length; i++) {
                if (applications[i].id !== application.id) {
                    continue;
                }
                if (applications[i].state === state) {
                    // make it a toggle
                    state = "no";
                }
                applications[i] = {
                    ...applications[i],
                    state,
                };
                break;
            }
            return { ...data, applications };
        });
    };

    const handleAccept = (application: ApplicationShape) => {
        updateApplicationState(application, "accepted");
    };

    const handleReject = (application: ApplicationShape) => {
        updateApplicationState(application, "rejected");
    };

    const handleSubmit = () => {
        console.log("parsing & sending");

        // TODO: send to server!
    };

    if (pageData === undefined) {
        // TODO: add preloader
        return <div>Loading!</div>;
    }

    return (
        <Container>
            <Link to={`/project/${projectid}`}>⬅️ Back to Project</Link>
            <Row>
                <Title>{pageData.name}</Title>
                {/* TODO: disable button if no changes yet */}
                <ButtonSubmit type="button" onClick={handleSubmit}>
                    Send changes!
                </ButtonSubmit>
            </Row>
            <ApplicationsContainer>
                {pageData.applications.map((app, key) => (
                    <Application key={key} {...{ application: app, handleAccept, handleReject }} />
                ))}
            </ApplicationsContainer>
        </Container>
    );
};

export default ProjectApplications;
