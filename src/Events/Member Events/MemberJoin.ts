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

    const canvas = new CanvasBuilder(`Welcome to ${member.guild.name}!`, member.user.avatarURL({ format: 'png' }));
    canvas.addText(`Make sure to read our #rules and #faq!`);
    canvas.addText(`Mineversa is currently in Season 1`);
    canvas.addText(` `);
    canvas.addText(`Discord: https://discord.mineversa.net/`);
    canvas.addText(`Store: https://store.mineversa.net/`);
    canvas.addText(`Server IP: play.mineversa.net`);

    channel.send(`${Emojis.ANIMATED_LOADING} Loading a canvas from CanvasBuilder`)
        .then(async(message) => {
            const send_canvas = await canvas.build();
            message.channel.send(send_canvas)
                .then(() => {
                    message.edit(`${Emojis.WAVE} Welcome our new user!`);
                });
        });

}

export const name = 'guildMemberAdd';