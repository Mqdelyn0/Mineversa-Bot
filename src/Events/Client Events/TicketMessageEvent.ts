import { GuildChannel, Message } from "discord.js";
import { EventRun } from "../../Interfaces/Events";
import { Bot } from "../../MineversaClient/MineversaClient";
import { TicketModel } from "../../Models/TicketModel";

export const run: EventRun = async(client: Bot, message: Message) => {
    const guildChannel = message.channel as GuildChannel;
	if(guildChannel.parentID !== client.getConfig().ticket_category || !guildChannel.name.startsWith('🎧︱responded-')) return;
	const ticket = (await TicketModel.findTicketByChannelId(guildChannel))[0];
	if(message.author.id !== ticket.creator) return;
	guildChannel.setName(`🎧︱waiting-${message.author.username}`);
}

export const name = 'message';