import { usersApi } from "@/lib/api";
import { deleteAurbitUserCredentials } from "./storage";

export const logoutUser = async () => {
    usersApi.logout();
    deleteAurbitUserCredentials();
}