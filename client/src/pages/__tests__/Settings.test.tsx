import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AxiosStatic } from "axios";
import { BrowserRouter as Router } from "react-router-dom";
import Settings from "../Settings";

jest.mock("axios");

const MockSettings = () => {
    const mockAxios = jest.createMockFromModule<AxiosStatic>("axios");
    mockAxios.create = jest.fn(() => mockAxios);
    const axios = mockAxios.create();
    act(() => {
        axios.get = jest.fn().mockImplementation(() =>
            Promise.resolve({
                data: { name: "username", email: "email@mail.com" },
            })
        );
    });

    return (
        <Router>
            <Settings {...{ axios }} />
        </Router>
    );
};

describe("Settings", () => {
    it("renders correctly", async () => {
        render(<MockSettings />);
        expect(screen.queryByText(/Please choose the field/)).toBeInTheDocument();
        expect(screen.queryByText("Changing...")).not.toBeInTheDocument();
    });

    it("click Change Name", async () => {
        render(<MockSettings />);
        // waitFor is necessary because otherwise the test will complete before the state changes have finished and Jest will not be very happy about it.
        await waitFor(() => {
            const changeName = screen.queryByText("Change Name");
            expect(changeName).toBeInTheDocument();
            fireEvent.click(screen.getByText("Change Name"));
            expect(screen.queryByText(/Please choose the field/)).not.toBeInTheDocument();
            expect(screen.queryByText("Changing...")).toBeInTheDocument();
        });
    });

    it("click Delete Account", async () => {
        render(<MockSettings />);
        await waitFor(() => {
            const deleteAcc = screen.queryByText("Delete Account");
            expect(deleteAcc).toBeInTheDocument();
            fireEvent.click(screen.getByText("Delete Account"));
            expect(screen.queryByText("Are you sure you want to delete this account?")).toBeInTheDocument();
        });
    });
});
