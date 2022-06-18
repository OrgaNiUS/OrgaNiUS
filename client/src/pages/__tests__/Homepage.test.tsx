import { render, screen } from "@testing-library/react";
import MockAuthProvider from "../../context/MockAuthProvider";
import Homepage from "../Homepage";

describe("welcome message", () => {
    it("renders correctly if good user", () => {
        const user: string = "test";

        const homepage: JSX.Element = (
            <MockAuthProvider {...{ user }}>
                <Homepage />
            </MockAuthProvider>
        );
        render(homepage);

        const welcomeMsg = screen.queryByTestId("welcome-message");
        expect(welcomeMsg).toBeInTheDocument();
        expect(welcomeMsg).toHaveTextContent(user);
    });

    it("renders placeholder if cannot find user (empty user)", () => {
        const user: string = "";

        const homepage: JSX.Element = (
            <MockAuthProvider {...{ user }}>
                <Homepage />
            </MockAuthProvider>
        );
        render(homepage);

        const welcomeMsg = screen.queryByTestId("welcome-message");
        expect(welcomeMsg).toBeInTheDocument();
        expect(welcomeMsg).toHaveTextContent("user");
    });
});

describe("contains inner components", () => {
    const user = "";

    const homepage: JSX.Element = (
        <MockAuthProvider {...{ user }}>
            <Homepage />
        </MockAuthProvider>
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
