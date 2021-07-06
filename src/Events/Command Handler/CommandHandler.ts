import { GuildMember, Message, TextChannel, User } from "discord.js";
import { Bot } from "../../MineversaClient/MineversaClient";
import { EmbedBuilder, EmbedColors } from "../../API/EmbedBuilder";
import { EventRun } from "../../Interfaces/Events";
import { Command, CommandRun } from "../../Interfaces/Commands";

// name?: string | undefined;
// aliases?: string[] | undefined;
// min_args?: number | undefined;
// max_args?: number | undefined;
// req_roles?: string[] | undefined;
// category?: string | undefined;
// run?: CommandRun | undefined;

export const run: EventRun = async(client: Bot, message: Message) => {
    if(message.author.bot || !message.content.startsWith(client.getConfig().prefix)) return;

    const { author, member } = message;

    const command_raw = message.content.slice(1).split(/[ ]+/);
    const command = command_raw[0].toLowerCase();
    const args = command_raw.splice(1);

    const command_run: Command = client.getCommands().get(command);
    if(!command_run) {
        let embed = new EmbedBuilder(`Hey <@${author.id}> :wave:\n\nThe command you tried doing is invalid!\nTry doing \`-help\` for the commands!`);
        
        embed.setColor(EmbedColors.ERROR);
        embed.setAuthor(`Unkown Command`, author.avatarURL());
        message.channel.send(embed.build());
        return;
    }

    if(command_run.min_args || command_run.max_args) {
        if(args.length < command_run.min_args || args.length > command_run.max_args) {
            let embed = new EmbedBuilder(`Hey <@${author.id}> :wave:\n\nThe arguments you put aren't in the bounds of this command's needed arguments!Try doing \`${command_run.help_cmd}\`!`);
        
            embed.setColor(EmbedColors.ERROR);
            embed.setAuthor(`Arguments Out of Bounds`, author.avatarURL());
            message.channel.send(embed.build());
            return;
        }
    }

    let has_role = false;
    if(command_run.req_roles) {
        const role_ids: string[] = member.roles.cache.map(role => `${role.name}`);

        command_run.req_roles.some(role_name => {
            if(role_ids.includes(role_name)) {
                has_role = true;
            }
        });
    } else {
        has_role = true;
    }

    if(!has_role) {
        let embed = new EmbedBuilder(`Hey <@${author.id}> :wave:\n\nIt seems like you are not permitted to do this command!\nOnly ${command_run.req_roles.map(role => `${role}s`).join(`, `)} can do this command!`);
        
        embed.setColor(EmbedColors.ERROR);
        embed.setAuthor(`Not Permitted`, author.avatarURL());
        message.channel.send(embed.build());
        return;
    }

    command_run.run(client, message, args, message.content);
    
}

export const name = 'message';