import { User } from "../entity/user";


function focusFilter(users : Array<User>,focusMode : string) : User{
    let availableUsers = users.filter((user)=>{
        return user.attackers.length < 4 && !user.deafeated;
    })
    return focusModes[focusMode](availableUsers) as User;
}

const focusModes : focusInterface = {
    "KO": (users : Array<User>) => {
        return focusFilterFirst(users, (userA : User, userB : User)=>{
            return userA.kos > userB.kos;
        });
    },
    "RANDOM": (users : Array<User>) => {
        return users[Math.ceil(Math.random() * users.length)]
    },
    "BADGES": (users : Array<User>) => {
        return focusFilterFirst(users, (userA : User, userB : User)=>{
            return userA.badges > userB.badges;
        });
    },
    "ATTACKERS": (users : Array<User>) => {
        return focusFilterFirst(users, (userA : User, userB : User)=>{
            return userA.badges > userB.badges && userA;
        });
    }
}

const focusFilterFirst = (array : Array<any>, filter : Function) => {
    let filteredUserByMode = array.sort((valueA, valueB)=>{
        return filter(valueA,valueB);
    })
    return filteredUserByMode[0];
}

enum focusModesEnum{
    "KO",
    "RANDOM",
    "BADGES",
    "ATTACKERS"
}

interface focusInterface {
    [key: string]: ((users : Array<User>)=>{});
}

export default focusFilter;