/* eslint-disable @typescript-eslint/no-explicit-any */
import { jwtDecode } from "jwt-decode";
import { setCookie } from "./cookieUtils";

export const getTokenSecondsRemaining = (token: string): number => {
    if (!token) return 0;
    try {
        const tokenPayload = jwtDecode(token) as any;
        if (tokenPayload && !tokenPayload.exp) return 0;

        const remainingSeconds = tokenPayload.exp - Math.floor(Date.now() / 1000);
        return remainingSeconds > 0 ? remainingSeconds : 0;
    } catch (error) {
        console.error("Error decoding token:", error);
        return 0;
    }
};

export const setTokenInCookies = async (
    name: string,
    token: string,
    fallbackMaxAgeInSeconds = 60 * 60 * 24 // 1 day
) => {
    let maxAgeInSeconds;
    if (name !== "better-auth.session_token") {
        maxAgeInSeconds = getTokenSecondsRemaining(token);
    }
    await setCookie(name, token, maxAgeInSeconds || fallbackMaxAgeInSeconds);
};

export const isTokenExpiringSoon = (token: string, thresholdInSeconds = 300): boolean => {
    const remainingSeconds = getTokenSecondsRemaining(token);
    return remainingSeconds > 0 && remainingSeconds <= thresholdInSeconds;
};

export const isTokenExpired = (token: string): boolean => {
    const remainingSeconds = getTokenSecondsRemaining(token);
    return remainingSeconds === 0;
};