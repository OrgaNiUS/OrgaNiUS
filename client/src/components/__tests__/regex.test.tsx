import {validEmail, validPassword, validPinCode, validUsername} from "../regex";

const validInputs = (type: string, inputs: string[]): boolean => {
    if (inputs.length == 0) return true;
    let result: boolean = true;
    switch (type) {
        case 'username': {
            inputs.forEach(function (str) {
                if (!validUsername.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'email': {
            inputs.forEach(function (str) {
                if (!validEmail.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'password': {
            inputs.forEach(function (str) {
                if (!validPassword.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'pin': {
            inputs.forEach(function (str) {
                if (!validPinCode.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        default: {
            result = false;
        }
    }
    return result;
}
const invalidInputs = (type: string, inputs: string[]): boolean => {
    if (inputs.length == 0) return true;
    let result: boolean = true;
    switch (type) {
        case 'username': {
            inputs.forEach(function (str) {
                if (validUsername.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'email': {
            inputs.forEach(function (str) {
                if (validEmail.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'password': {
            inputs.forEach(function (str) {
                if (validPassword.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'pin': {
            inputs.forEach(function (str) {
                if (validPinCode.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        default: {
            result = false;
        }
    }
    return result;
}


describe("Regex tests", () => {
    // Username cannot be numbers only
    it('username validity tests', () => {
        expect(validInputs('username', ["ABCDE", "ABCDEF", "ABCDEFG", "WERTYUI", "xcvbnm", "dfghjklgh"])).toBe(true);
        expect(invalidInputs('username', ["x", "xx", "xxx", "xxxx", "dfghjklghѼ", "Ab**&"])).toBe(true);
    })
    // "email@123.123.123.123" this format is considered invalid by regex
    it('email validity tests', () => {
        expect(validInputs('email', ['email@example.com', 'firstname.lastname@example.com', 'email@subdomain.example.com', "firstname+lastname@example.com", "1234567890@example.com", "email@example-one.com", "_______@example.com", "email@example.name", "email@example.museum", "email@example.co.jp", "firstname-lastname@example.com"])).toBe(true);
        expect(invalidInputs('email', ["plainaddress", "#@%^%#$@#$@#.com", "@example.com", "email.example.com", "email@example@example.com", ".email@example.com", "email.@example.com", "email..email@example.com", "email@example..com", "Abc..123@example.com"])).toBe(true);
    })
    it('password validity tests', () => {
        expect(validInputs('password', ['Password123', 'Password2', 'Password3'])).toBe(true);
        expect(invalidInputs('password', ['password123', 'PASSWORD1', 'Password'])).toBe(true);
    })
    it('pin validity tests', () => {
        expect(validInputs('pin', ['A12345', '123456', '321SAD'])).toBe(true);
        expect(invalidInputs('pin', ['ABED213', 'data232', 'hello1', 'bye123'])).toBe(true);
    })
})