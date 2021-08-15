import { GuildMember, Role, User } from "discord.js";

export class RoleCheck {

    public static getResult(user: GuildMember, roles: Array<String>): Boolean {
        let success = false;
        roles.forEach(role => {
            let roleParsed = user.guild.roles.cache.find(findRole => findRole.name === role);
            if(user.roles.cache.has(roleParsed.id)) success = true;
        });
        return success;
    }

}