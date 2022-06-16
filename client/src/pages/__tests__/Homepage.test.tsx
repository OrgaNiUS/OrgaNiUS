import { render, screen } from "@testing-library/react";
import AuthContext from "../../context/AuthProvider";
import Homepage from "../Homepage";

describe("welcome message", () => {
    it("renders correctly if good user", () => {
        const user: string = "test";

        const homepage: JSX.Element = (
            <AuthContext.Provider value={{ auth: { user: user, loggedIn: true }, setAuth: jest.fn() }}>
                <Homepage />
            </AuthContext.Provider>
        );
        render(homepage);

        const welcomeMsg = screen.queryByTestId("welcome-message");
        expect(welcomeMsg).toBeInTheDocument();
        expect(welcomeMsg).toHaveTextContent(user);
    });

    it("renders placeholder if cannot find user (empty user)", () => {
        const user: string = "";

        const homepage: JSX.Element = (
            <AuthContext.Provider value={{ auth: { user: user, loggedIn: true }, setAuth: jest.fn() }}>
                <Homepage />
            </AuthContext.Provider>
        );
        render(homepage);

        const welcomeMsg = screen.queryByTestId("welcome-message");
        expect(welcomeMsg).toBeInTheDocument();
        expect(welcomeMsg).toHaveTextContent("user");
    });
});

describe("contains inner components", () => {
    const homepage: JSX.Element = (
        <AuthContext.Provider value={{ auth: { user: "test", loggedIn: true }, setAuth: jest.fn() }}>
            <Homepage />
        </AuthContext.Provider>
    );

    it("contains todo", () => {
        render(homepage);
        expect(screen.queryByText("To-Do")).toBeInTheDocument();
    });

    it("contains resizer", () => {
        render(homepage);
        expect(screen.queryByTestId("resizer-left")).toBeInTheDocument();
        expect(screen.queryByTestId("resizer-right")).toBeInTheDocument();
    });

    it("contains scheduler", () => {
        render(homepage);
        expect(screen.queryByText("Today")).toBeInTheDocument();
    });

    it("contains timeline", () => {
        render(homepage);
        expect(screen.queryByTestId("timeline")).toBeInTheDocument();
    });
});
