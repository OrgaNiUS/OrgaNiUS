import {validEmail, validPassword, validUsername, validPinCode} from "../regex";

const validInputs = (type: string, inputs: string[]): boolean => {
    if(inputs.length == 0) return true;
    let result: boolean = true;
    switch(type) {
        case 'username': {
            inputs.forEach(function(str) {
                if (!validUsername.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'email': {
            inputs.forEach(function(str) {
                if (!validEmail.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'password': {
            inputs.forEach(function(str) {
                if (!validPassword.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'pin': {
            inputs.forEach(function(str) {
                if (!validPinCode.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        default: {
            result =  false;
        }
    }
    return result;
}
const invalidInputs  = (type: string, inputs: string[]): boolean => {
    if(inputs.length == 0) return true;
    let result: boolean = true;
    switch(type) {
        case 'username': {
            inputs.forEach(function(str) {
                if (validUsername.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'email': {
            inputs.forEach(function(str) {
                if (validEmail.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'password': {
            inputs.forEach(function(str) {
                if (validPassword.test(str)) {
                    result = false;
                    console.log(str);
                }
            })
            break;
        }
        case 'pin': {
            inputs.forEach(function(str) {
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
    it('username validity tests', () => {
        expect(validInputs('username', ['U123456', 'username123', 'User.'])).toBe(true);
        expect(invalidInputs('username', ['U', 'user', '12345678910111213141516', 'User@!invalid'])).toBe(true);
    })
    it('email validity tests', () => {
        expect(validInputs('email', ['saraan@gmail.com', 'jinwei@gmail.com', 'e1234567@u.nus.edu'])).toBe(true);
        expect(invalidInputs('email', ['dispersant', 'surfboards', 'fnsaasn@fjnaipsfiasnoinsapdpas', 'abrasion.com'])).toBe(true);
    })
    it('password validity tests', () => {
        expect(validInputs('password', ['Password123', 'Password2', 'Password3'])).toBe(true);
        expect(invalidInputs('password', ['password123', 'PASSWORD1', 'Password'])).toBe(true);
    })
    it('pin validity tests', () => {
        expect(validInputs('pin', ['A12345', '123456', '321SAD'])).toBe(true);
        expect(invalidInputs('pin', ['ABED213','data232','hello1', 'bye123'])).toBe(true);
    })
})