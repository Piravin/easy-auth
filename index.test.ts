import AuthenticatorConfig, { dbAdapter, SmoothExit } from ".";
import SignUp from "./functions/signup";
import bcrypt from "bcrypt";
import VerifyUser from "./functions/verification";
import LoginUser from "./functions/login";
import jwt, { JwtPayload } from "jsonwebtoken";
import CheckAuth from "./functions/checkAuth";
import { RequestReset, ValidateReset } from "./functions/resetPassword";
import ElevateUser from "./functions/elevateUser";

const BCRYPT_SALT = 10;
const SERVER_NAME = "localhost";
const JWT_SECRET = "dummy-jwt=secret";

beforeAll(async () => {
    await AuthenticatorConfig(
        "mongodb://localhost:27017", SERVER_NAME, "", "", JWT_SECRET, String(BCRYPT_SALT)
    );
    await dbAdapter?.claerDb();
});

afterAll(async () => {
    await SmoothExit();
});

const username = "user-1";
const email = "user1@email.com";
const password = "password-1";
let code: string; // hash of userId
let id: string;
let token: string;

describe('sign-up', () => {

    it("should sign-up user and return verification link", async () => {

        const response = await SignUp(username, email, password, true);
        
        const userId = await dbAdapter?.checkExists({email: email});

        const mockResponse = {
            link: expect.any(String),//`${SERVER_NAME}/auth/verify?id=${userId}&code=${expect.anything()}`,
            userId: userId,
            code: expect.any(String)
        };

        expect(response).toEqual(mockResponse);
        code = response.code!;
        id = response.userId!;
    });

    it("should return user allready exists", async () => {
        const response = await SignUp(username, email, password, true);
        const mockResponse = {
            status: false,
            message: "User allready exists"
        }
        expect(response).toEqual(mockResponse);
    });

    it("should verify user using link mailed", async () => {
        let response = await VerifyUser(id, code);
        expect(response).toBe(true);
    });

    it("should update verified field for user in database", async () => {
        let response = await dbAdapter?.getValues({email: email}, ["verified"]);
        let mockResponse = {
            _id: id,
            verified: true
        }
        expect(response).toEqual(mockResponse);
    });

});

describe("login", () => {
    
    type response = {
        status: boolean,
        data?: {token: string},
        message: string
    }
    let result: response;

    it("should login user successfully", async () => {
        result = await LoginUser(email, password);
        const mockResult = {
            status: true,
            data: {token: expect.any(String)},
            message: "Login successful."
        }
        token = result.data!.token;
        expect(result).toEqual(mockResult);
    });

    it("should verify jwt sent in the response", async () => {
        const response = await jwt.verify(token, JWT_SECRET);
        let resultData: JwtPayload = typeof(response) == "string" ? {} : response;

        const userId = await dbAdapter?.checkExists({_id: resultData.userId});
        expect(userId).toEqual(id);
    });

    it("should return login failure", async () => {
        result = await LoginUser(email, "pass");
        const mockResult = {
            status: false,
            message: expect.any(String)
        };
        expect(result).toEqual(mockResult);
    });

});

describe("Verify Authentication", () => {
    
    it("should return successful user authentication", async () => {
        const result = await CheckAuth(token);
        const mockResult = {
            status: true,
            data: {
                userName: username,
                userEmail: email
            },
            message: expect.any(String)
        };
        expect(result).toEqual(mockResult);
    });

    it("should return unauthorized", async () => {
        const response = await CheckAuth(token, 2);
        const mockResult = {
            status: false,
            message: expect.anything()
        };
        expect(response).toEqual(mockResult);
    });

    it("should elevate user", async () => {
        const response = await ElevateUser(email, 2);
        const mockResult = {
            status: true
        };
        expect(response).toEqual(mockResult);
    });

    it("should return authorized", async () => {
        const response = await CheckAuth(token, 2);
        const mockResult = {
            status: true,
            data: expect.anything(),
            message: expect.anything()
        };
        expect(response).toEqual(mockResult);
    });

    it("should return failed authentication", async () => {
        const tamperedToken = await jwt.sign(id, "falk-jwt-secret");
        const result = await CheckAuth(tamperedToken);
        const mockResult = {
            status: false,
            message: expect.anything()
        };
        expect(result).toEqual(mockResult);
    });
});

describe("password-reset", () => {

    let resetToken: string;

    it("should return password reset token", async () => {
        const result = await RequestReset(email, true);
        const mockResult = {
            status: true,
            resetToken: expect.any(String)
        };
        expect(result).toEqual(mockResult);
        resetToken = result.resetToken!;
    });

    it("should check reset token", async () => {
        const result = await jwt.verify(resetToken!, JWT_SECRET);
        expect(result).toBe(id);
    })

    it("should return user not found", async () => {
        const result = await RequestReset("fake-email", true);
        const mockResult = {
            status: false,
            message: expect.any(String)
        };
        expect(result).toEqual(mockResult);
    });

    it("should reset password successfully", async () => {
        const result = await ValidateReset(resetToken, "new-password");
        const mockResult = {
            status: true,
            message: expect.any(String)
        };
        expect(result).toEqual(mockResult);
    });

    it("should return login unsuccessful with old password", async () => {
        const result = await LoginUser(email, password);
        const mockResult = {
            status: false,
            message: expect.any(String)
        };
        expect(result).toEqual(mockResult);
    });

    it("should successfully login with new password", async () => {
        const result = await LoginUser(email, "new-password");
        const mockResult = {
            status: true,
            data: {token: expect.any(String)},
            message: expect.any(String)
        };
        expect(result).toEqual(mockResult);
    });

});