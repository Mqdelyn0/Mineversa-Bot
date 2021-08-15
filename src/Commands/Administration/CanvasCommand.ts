import { Message, TextChannel } from "discord.js";
import { Bot } from "../../MineversaClient/MineversaClient";
import { CommandRun } from "../../Interfaces/Commands";
import { EmbedBuilder } from "../../API/EmbedBuilder";
import { CanvasBuilder } from "../../API/CanvasBuilder";
import { Emojis } from "../../Interfaces/Emojis";

export const run: CommandRun = async(client: Bot, message: Message, args: string[]): Promise<Boolean> => {

    if(args[0] === `help`) {
        let embed = new EmbedBuilder(`The correct usage of this command is:\n\`-canvas (title) (lines)\`\n\nEvery space in your titles and lines have to be a dash (-) instead of an actual space.`);
        embed.setAuthor(`Canvas Command`, message.author.avatarURL());

        message.channel.send(embed.build());
    } else {

        const title = args[0].replace(/-/g, ` `);
        const lines = [];

        args.splice(1).forEach(line => {
            lines.push(line.replace(/-/g, ` `));
        });

        const canvas = new CanvasBuilder(title, message.author.avatarURL({ format: 'png' }));
        canvas.addTexts(lines);

        message.channel.send(`${Emojis.ANIMATED_LOADING} Creating the Canvas from the CanvasBuilder class!`)
            .then(async(message) => {
                const built_canvas = await canvas.build();

                message.edit(`${Emojis.ANIMATED_CHECKMARK} Finished creating the Canvas from the CanvasBuilder class!`);
                message.channel.send(built_canvas);
                setTimeout(() => {
                    message.delete();
                }, 2500);
            });
    }

    return true;
}

export const name = 'canvas';
export const min_args = 1;
export const req_roles = [`Director`, `Manager`, `Developer`, `Administrator`];
export const category = `💻  Administration`;
export const help_cmd = `-canvas help`;