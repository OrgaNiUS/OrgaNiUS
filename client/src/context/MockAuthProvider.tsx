import { AxiosInstance, AxiosStatic } from "axios";
import AuthContext from "./AuthProvider";

const mockAxios = jest.createMockFromModule<AxiosStatic>("axios");
mockAxios.create = jest.fn(() => mockAxios);
const axios = mockAxios.create();
axios.get = jest.fn().mockImplementation(() =>
    Promise.resolve({
        data: { name: "username", email: "email@mail.com" },
    })
);

/**
 * To be used for testing purposes only.
 * For an example, see Settings.test.tsx.
 */
const MockAuthProvider = ({
    user,
    axiosInstance,
    children,
}: {
    user: string;
    axiosInstance?: AxiosInstance;
    children: JSX.Element;
}) => {
    if (axiosInstance === undefined) {
        axiosInstance = axios;
    }

    return (
        <AuthContext.Provider
            value={{ auth: { user: user, loggedIn: true }, setAuth: jest.fn(), axiosInstance: axiosInstance }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default MockAuthProvider;
