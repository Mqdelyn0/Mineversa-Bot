import { Message, MessageEmbed } from "discord.js";
import { Bot } from "../../MineversaClient/MineversaClient";
import { EmbedBuilder } from "../../API/EmbedBuilder";
import { Command, CommandRun } from "../../Interfaces/Commands";
import { PaginatedEmbeds } from "../../API/PaginatedEmbed";
import { Emojis } from "../../Interfaces/Emojis";

export const run: CommandRun = async(client: Bot, message: Message): Promise<Boolean> => {

    const categories = [];
    const added = [];

    client.getCommands().forEach((command, index) => {
        if(!categories.includes(command.category)) categories.push(command.category);
    });

    let index = 0;
    let embeds = [];
    categories.forEach(category => {
        index++;

        const embed = new EmbedBuilder(``, `${category}`);

        client.getCommands().forEach((command) => {
            if(command.category === category && !added.includes(command)) {
                embed.addField(`#${index}: ${command.name}`, `${command.description ?? `No Description Set.`}`);
                added.push(command);
            }
         }) 

        embeds.push(embed.build());
    });

    const paginated_message = await message.channel.send(`${Emojis.ANIMATED_LOADING} Here's the commands list!`);
    const paginated_embed: PaginatedEmbeds = new PaginatedEmbeds(embeds, paginated_message, message.author);
    paginated_embed.start();

    return true;
}

export const name = 'help';
export const category = `🧑‍🤝‍🧑  General`;
export const help_cmd = `-help`;