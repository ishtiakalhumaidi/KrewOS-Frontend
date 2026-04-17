import Cookies from "js-cookie";

export const setAccessToken = (token: string) => {
  Cookies.set("accessToken", token, { expires: 1 }); // 1 day
};

export const getAccessToken = () => {
  return Cookies.get("accessToken");
};

export const removeAccessToken = () => {
  Cookies.remove("accessToken");
};