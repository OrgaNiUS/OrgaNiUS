import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import Registration from '../Registration';
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {validEmail, validPassword, validUsername} from "../../components/regex";
import {MemoryRouter} from "react-router";
import Login from "../Login";

const MockRegistration = () => {
    return (
        <Router>
            <Registration/>
        </Router>)
}

describe('Registration', () => {
    describe('input fields take in input', () => {
        it('username takes in and updates input', () => {
            render(<MockRegistration/>);
            const userInputElement: HTMLInputElement = screen.getByPlaceholderText('Username (Min. 5 characters)');
            fireEvent.change(userInputElement, {target: {value: 'TestUser'}});
            expect(userInputElement.value).toBe('TestUser');
        })

        it('email takes in and updates input', () => {
            render(<MockRegistration/>);
            const emailInputElement: HTMLInputElement = screen.getByPlaceholderText('Email address');
            fireEvent.change(emailInputElement, {target: {value: 'testEmail@gmail.com'}});
            expect(emailInputElement.value).toBe('testEmail@gmail.com');
        })

        it('password takes in and updates input', () => {
            render(<MockRegistration/>);
            const pwdInputElement: HTMLInputElement = screen.getByPlaceholderText('Password');
            fireEvent.change(pwdInputElement, {target: {value: 'testPassword123'}});
            expect(pwdInputElement.value).toBe('testPassword123');
        })

        it('match password takes in and updates input', () => {
            render(<MockRegistration/>);
            const matchPwdInputElement: HTMLInputElement = screen.getByPlaceholderText('Re-Enter Your Password');
            fireEvent.change(matchPwdInputElement, {target: {value: 'testPassword123'}});
            expect(matchPwdInputElement.value).toBe('testPassword123');
        })
    })

    // https://www.linkedin.com/pulse/mocking-react-hooks-usestate-useeffect-leonard-lin/
    describe('react hooks tests', () => {
        it('User input tests', () => {

            jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
            jest.spyOn(validUsername, 'test')

            render(<MockRegistration/>);
            const userInputElement: HTMLInputElement = screen.getByPlaceholderText('Username (Min. 5 characters)');
            fireEvent.change(userInputElement, {target: {value: 'test1'}});
            fireEvent.change(userInputElement, {target: {value: 'test2'}});
            fireEvent.change(userInputElement, {target: {value: 'test3'}});

            expect(validUsername.test).toHaveBeenCalledTimes(4);
            expect(validUsername.test).toHaveBeenLastCalledWith('test3');
        })

        it('Email input tests', () => {

            jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
            jest.spyOn(validEmail, 'test')

            render(<MockRegistration/>);
            const emailInputElement: HTMLInputElement = screen.getByPlaceholderText('Email address');
            fireEvent.change(emailInputElement, {target: {value: 'test1'}});
            fireEvent.change(emailInputElement, {target: {value: 'test2'}});
            fireEvent.change(emailInputElement, {target: {value: 'test3'}});

            expect(validEmail.test).toHaveBeenCalledTimes(4); // initially called once with empty string.
            expect(validEmail.test).toHaveBeenLastCalledWith('test3');
        })

        it('Password input tests', () => {

            jest.spyOn(React, 'useEffect').mockImplementation((f) => f());
            jest.spyOn(validPassword, 'test')

            render(<MockRegistration/>);
            const pwdInputElement: HTMLInputElement = screen.getByPlaceholderText('Password');
            fireEvent.change(pwdInputElement, {target: {value: 'test1'}});
            fireEvent.change(pwdInputElement, {target: {value: 'test2'}});
            fireEvent.change(pwdInputElement, {target: {value: 'test3'}});

            expect(validPassword.test).toHaveBeenCalledTimes(4);
            expect(validPassword.test).toHaveBeenLastCalledWith('test3');
        })
    })

    it('navigates to login page on clicking home button', async () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/registration" element={<Registration />} />
                </Routes>
            </MemoryRouter>
        )
        fireEvent.click(screen.getByText('OrgaNiUS'));
        expect(await screen.findByText('Welcome to OrgaNiUS!')).toBeInTheDocument();
    })
})