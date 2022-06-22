import { fireEvent, render, screen } from "@testing-library/react";
import Modal from "../Modal";
import "../styles/Modal.module.css";

describe("conditional render", () => {
    it("renders when active", () => {
        render(<Modal {...{ active: true, body: <div>Body</div>, callback: jest.fn() }} />);
        expect(screen.queryByText("Body")).toBeVisible();
    });

    it("does not render when inactive", () => {
        render(<Modal {...{ active: false, body: <div>Body</div>, callback: jest.fn() }} />);
        expect(screen.queryByText("Body")).not.toBeVisible();
    });
});

describe("close callback function", () => {
    it("close callback not called when body clicked", () => {
        const cb = jest.fn();
        render(<Modal {...{ active: true, body: <div>Body</div>, callback: cb }} />);

        const body = screen.getByText("Body");
        fireEvent.click(body);
        expect(cb).not.toBeCalled();

        const outside = screen.getByTestId("outer");
        fireEvent.click(outside);
        expect(cb).toHaveBeenCalledTimes(1);
    });

    it("close callback called when clicked outside body", () => {
        const cb = jest.fn();
        render(<Modal {...{ active: true, body: <div>Body</div>, callback: cb }} />);

        const outside = screen.getByTestId("outer");
        fireEvent.click(outside);
        expect(cb).toHaveBeenCalledTimes(1);
    });
});
