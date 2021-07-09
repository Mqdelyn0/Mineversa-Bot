import { Channel,  GuildChannel,  GuildMember, MessageAttachment, TextChannel } from "discord.js";
import { EventRun } from "../../Interfaces/Events";
import { Bot } from "../../MineversaClient/MineversaClient";
import Canvas from "canvas";
import path from "path";
import { CanvasBuilder } from "../../API/CanvasBuilder";
import { Emojis } from "../../Interfaces/Emojis";

// Fonts
Canvas.registerFont(path.resolve(__dirname, '../../../assets/Fonts/Panton-BlackCaps.otf'), { family: 'Panton' });
Canvas.registerFont(path.resolve(__dirname, '../../../assets/Fonts/Panton-BlackitalicCaps.otf'), { family: 'Panton' });
Canvas.registerFont(path.resolve(__dirname, '../../../assets/Fonts/Panton-LightCaps.otf'), { family: 'Panton' });
Canvas.registerFont(path.resolve(__dirname, '../../../assets/Fonts/Panton-LightitalicCaps.otf'), { family: 'Panton' });

export const run: EventRun = async(client: Bot, member: GuildMember) => {
    
    const channel = client.channels.cache.get(client.getConfig().welcome_bye) as TextChannel;

    const canvas = new CanvasBuilder(`See you from ${member.guild.name}!`, member.user.displayAvatarURL({ format: 'png' }));
    canvas.addText(`We are sad to see you go from Mineversa`);
    canvas.addText(`We hoped you enjoyed your`);
    canvas.addText(`stay while you were here!`);
    canvas.addText(` `);
    canvas.addText(`Madelyn,`);
    canvas.addText(`${Emojis.HEART} Management of Mineversa.`);

    channel.send(`${Emojis.ANIMATED_LOADING} Loading a canvas from CanvasBuilder`)
        .then(async(message) => {
            const send_canvas = await canvas.build();
            message.channel.send(send_canvas)
                .then(() => {
                    message.edit(`${Emojis.WAVE} Say bye to ${member.user.tag} :(!`);
                });
        });

}

export const name = 'guildMemberRemove';