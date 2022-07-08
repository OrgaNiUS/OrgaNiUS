import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import { ProjectChoose, ProjectGetApplications } from "../../api/ProjectAPI";
import AuthContext from "../../context/AuthProvider";
import { toTitleCase } from "../../functions/strings";
import { BaseButton, IconButton } from "../../styles";
import PreLoader from "../PreLoader";

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

interface DataShape {
    id: string /* id of project */;
    name: string /* name of project */;
    applications: ApplicationShape[];
}

type state = "no" | "accepted" | "rejected";
interface ApplicationShape {
    id: string; // userid of applicant
    name: string; // name of applicant
    description: string; // description that applicant provided
    state: state; // current state of application
}

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
            {application.state !== "no" && <div>State: {toTitleCase(application.state)}</div>}
        </ApplicationCard>
    );
};

const ProjectApplications = (): JSX.Element => {
    const auth = useContext(AuthContext);
    const [loading, setLoading] = useState<boolean>(true);
    const [pageData, setPageData] = useState<DataShape | undefined>(undefined);
    const { id: projectid } = useParams();

    const loadData = () => {
        setLoading(true);

        ProjectGetApplications(
            auth.axiosInstance,
            { projectid: projectid ?? "" },
            (response) => {
                const data = response.data;

                setPageData({
                    id: data.id,
                    name: data.name,
                    applications: data.applicants.map((app: any) => {
                        return { ...app, state: "no" };
                    }),
                });

                setLoading(false);
            },
            () => {}
        );
    };

    useEffect(() => {
        loadData();
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
        if (pageData === undefined || projectid === undefined) {
            // should never happen because the button to submit would not be displayed anyways
            // so this is more for typechecking
            return;
        }

        const accepted: ApplicationShape[] = pageData.applications.filter((app) => app.state === "accepted");
        const rejected: ApplicationShape[] = pageData.applications.filter((app) => app.state === "rejected");

        setPageData((data) => {
            if (data === undefined) {
                return undefined;
            }

            return {
                ...data,
                applications: data.applications.filter((app) => app.state === "no"),
            };
        });

        // payload only requires userid
        const payload = {
            projectid: projectid,
            acceptedUsers: accepted.map((app) => app.id),
            rejectedUsers: rejected.map((app) => app.id),
        };

        ProjectChoose(
            auth.axiosInstance,
            payload,
            () => {},
            () => {}
        );
    };

    if (pageData === undefined) {
        return (
            <Container>
                <Link to={`/project/${projectid}`}>⬅️ Back to Project</Link>
                <PreLoader {...{ loading }} />
            </Container>
        );
    }

    return (
        <Container>
            <Link to={`/project/${projectid}`}>⬅️ Back to Project</Link>
            <Row>
                <Title>{pageData.name}</Title>
                {/* TODO: add button to refresh data */}
                <ButtonSubmit
                    type="button"
                    onClick={handleSubmit}
                    disabled={!pageData.applications.some((app) => app.state !== "no")}
                >
                    Send changes!
                </ButtonSubmit>
            </Row>
            <ApplicationsContainer>
                {pageData.applications.length === 0 ? (
                    <div>No applications found!</div>
                ) : (
                    pageData.applications.map((app, key) => (
                        <Application key={key} {...{ application: app, handleAccept, handleReject }} />
                    ))
                )}
            </ApplicationsContainer>
        </Container>
    );
};

export default ProjectApplications;
