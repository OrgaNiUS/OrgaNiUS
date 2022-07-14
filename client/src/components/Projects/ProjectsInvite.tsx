import { useContext, useState } from "react";
import styled from "styled-components";
import { ProjectInvite } from "../../api/ProjectAPI";
import AuthContext from "../../context/AuthProvider";
import { BaseButton, InputCSS } from "../../styles";

const Container = styled.div`
    background-color: white;
    border-radius: 6px;
    border: 1px solid rgb(59, 130, 246);
    max-height: 40%;
    overflow-y: auto;
    padding: 1rem 1rem;
    position: absolute;
    right: 4rem;
    top: 10rem;
    width: 20%;
    z-index: 50;
`;

const Title = styled.h1`
    font-size: 1.3rem;
    margin-bottom: 0.3rem;
`;

const Input = styled.input`
    ${InputCSS}
    width: 85%;
`;

const IconButton = styled.button`
    &:hover {
        color: rgb(59, 130, 246);
    }
`;

const ButtonAdd = styled(IconButton)`
    float: right;
    padding-top: 7px; /* same as InputCSS's padding */
`;

const ButtonSubmit = styled(BaseButton)`
    background-color: rgb(59, 130, 246);
    float: right;
`;

const ButtonCancel = styled(BaseButton)`
    background-color: white;
    border: 1px solid black;
    color: black;
    float: right;
`;

/**
 * For clarity, this is the invitation panel for a admin of a project to invite other users.
 */
const ProjectsInvite = ({
    projectid,
    setShowInviteWindow,
}: {
    projectid: string;
    setShowInviteWindow: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
    const auth = useContext(AuthContext);
    const [allInvites, setAllInvites] = useState<Set<string>>(new Set());
    const [currentInvite, setCurrentInvite] = useState<string>("");

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        event.preventDefault();

        setCurrentInvite(event.target.value);
    };

    const handleAdd = (event: any) => {
        event.preventDefault();

        if (currentInvite === "") {
            return;
        }

        setAllInvites((invites) => {
            const invitesCopy: Set<string> = new Set(invites);
            if (!invitesCopy.has(currentInvite)) {
                setCurrentInvite("");
                invitesCopy.add(currentInvite);
            }
            return invitesCopy;
        });
    };

    const handleRemove = (name: string) => {
        setAllInvites((invites) => {
            const invitesCopy: Set<string> = new Set(invites);
            invitesCopy.delete(name);
            return invitesCopy;
        });
    };

    const handleSubmit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
        event.preventDefault();

        setAllInvites(new Set());

        const users: string[] = Array.from(allInvites);

        ProjectInvite(
            auth.axiosInstance,
            { users, projectid },
            () => {},
            () => {}
        );
    };

    return (
        <Container>
            <Title>Invite members...</Title>
            <form onSubmit={handleAdd}>
                <div className="relative my-2">
                    <Input onChange={handleChange} value={currentInvite} autoFocus />
                    <ButtonAdd onClick={handleAdd}>
                        {/* plus from https://heroicons.com/ */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </ButtonAdd>
                </div>
                <div>
                    {Array.from(allInvites).map((invite, key) => {
                        return (
                            <div key={key} className="pl-2">
                                <span>{invite}</span>
                                <IconButton className="float-right" onClick={() => handleRemove(invite)}>
                                    {/* minus from https://heroicons.com/ */}
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                                    </svg>
                                </IconButton>
                            </div>
                        );
                    })}
                </div>
                <ButtonSubmit type="button" onClick={handleSubmit}>
                    Send Invites!
                </ButtonSubmit>
                <ButtonCancel type="button" onClick={() => setShowInviteWindow(false)}>
                    Cancel
                </ButtonCancel>
            </form>
        </Container>
    );
};

export default ProjectsInvite;
