import { GuildMember, Role, User } from "discord.js";

export class RoleCheck {

    private _user: GuildMember;
    private _roles: Array<String>;

    public constructor(user: GuildMember, roles: Array<String>) {
        this._user = user;
        this._roles = roles;
    }

    public getResult(): Boolean {
        this._roles.forEach(role => {
            let roleParsed = this._user.guild.roles.cache.find(findRole => findRole.name === role);
            if(this._user.roles.cache.has(roleParsed.id)) return true;
        })
        return false;
    }

}