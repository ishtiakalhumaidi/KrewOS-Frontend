/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtVerify } from "jose";
import { jwtDecode } from "jwt-decode";

export const jwtUtils = {
    verifyToken: async (token: string, secret: string) => {
        try {
            const secretKey = new TextEncoder().encode(secret);
            const { payload } = await jwtVerify(token, secretKey);
            return { success: true, data: payload };
        } catch (error: any) {
            return { success: false, message: error.message, error };
        }
    },
    decodedToken: (token: string) => {
        return jwtDecode(token) as any;
    }
};