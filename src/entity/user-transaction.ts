import { User } from "./user";

export class UserTransaction{
    user !: User;
    otherUsers !: Array<User>;
}