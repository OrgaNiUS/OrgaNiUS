import {fireEvent, render, screen} from '@testing-library/react';
import React from 'react';
import Login from '../Login';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {MemoryRouter} from "react-router";
import ForgotPwd from "../ForgotPwd";
import Registration from "../Registration";

const MockLogin = () => {
    return (
        <Router>
            <Login/>
        </Router>)
}



describe("Login", () => {
    it('login form renders on screen', async () => {
        render(<MockLogin/>);
        const formElement: HTMLFormElement = screen.getByTestId('login-form');
        expect(formElement).toBeInTheDocument();
    })

    it('username input takes in value', async () => {
        render(<MockLogin/>);
        const userInputElement: HTMLInputElement = screen.getByPlaceholderText('Email address or Username');
        fireEvent.change(userInputElement, {target: {value: 'TestUser'}});
        expect(userInputElement.value).toBe('TestUser');
    })

    it('password input takes in value', async () => {
        render(<MockLogin/>);
        const pwdInputElement: HTMLInputElement = screen.getByPlaceholderText('Password');
        fireEvent.change(pwdInputElement, {target: {value: 'TestPassword'}});
        expect(pwdInputElement.value).toBe('TestPassword');
    })

    it('forget password underlines on hover', async () => {
        render(<MockLogin/>);
        const forgetPwdElement = screen.getByText('Forgot password?');
        fireEvent.mouseOver(forgetPwdElement);
        expect(forgetPwdElement).toHaveClass('text-blue-600 hover:text-blue-700 focus:text-blue-700 active:text-blue-800 duration-200 transition ease-in-out hover:underline');
    })

    it('navigates to forget_pwd page on click', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/forgot_pwd" element={<ForgotPwd />} />
                </Routes>
            </MemoryRouter>
        )
        fireEvent.click(screen.getByText('Forgot password?'));
        expect(await screen.findByTestId('fgt-pwd-indicator')).toBeInTheDocument();
    })

    it('navigates to register page on click', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/registration" element={<Registration />} />
                </Routes>
            </MemoryRouter>
        )
        fireEvent.click(screen.getByText('Register'));
        expect(await screen.findByText('OrgaNiUS Registration')).toBeInTheDocument();
    })
})