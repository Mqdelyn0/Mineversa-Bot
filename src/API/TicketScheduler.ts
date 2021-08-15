import { DocumentType } from "@typegoose/typegoose";
import { GuildChannel, ReactionUserManager, TextChannel } from "discord.js";
import { EventEmitter } from "events";
import { Bot } from "../MineversaClient/MineversaClient";
import { Ticket, TicketModel } from "../Models/TicketModel";
import { EmbedBuilder, EmbedColors, EmbedFooters } from "./EmbedBuilder";

const twelveHours = 4.32e7;

export class TicketScheduler extends EventEmitter {

	private _timeouts: Map<GuildChannel, NodeJS.Timeout>;

	public constructor() {
		super();
		this._timeouts = new Map();
		this.refresh();
	}

	public async refresh() {
		this._timeouts.forEach((t) => clearTimeout(t));
		
		const client = Bot.getInstance();

		(await TicketModel.find({ auto_deletion: true, creation_date: { $gte: new Date(new Date().getTime() - twelveHours) } })).forEach((t: DocumentType<Ticket>) => {
			const guildChannel = client.channels.cache.get(t.channel as string) as GuildChannel;
			const textChannel = guildChannel as TextChannel;
			const timeout = async () => {
				t = (await TicketModel.findTicketByChannelId(guildChannel))[0];
				if(!t.auto_deletion) return;
				let latestMessage = (await textChannel.messages.fetch({ limit: 1 })).first();
				// removing 500 milliseconds just to be a bit lenient, maybe sometimes the answer would be a half second short of twelve hours, or something like it
				if(new Date().getTime() - latestMessage.createdTimestamp >= twelveHours - 500 && t.auto_deletion) {
					if(!t.auto_deletion) return;
					const embed = new EmbedBuilder(`Your ticket is going to be deleted in 12 hours due to inactivity. To prevent this, please send a message, or run -ticket evadedeletion.`);
					embed.setColor(EmbedColors.MAIN);
					embed.setFooter(EmbedFooters.TICKET);
					textChannel.send(embed.build());
					setTimeout(async () => {
						latestMessage = (await textChannel.messages.fetch({ limit: 1 })).first();
						if(latestMessage.author.id === client.user.id && t.auto_deletion) {
							TicketModel.deleteTicket(guildChannel);
							return;
						} else if(t.auto_deletion) {
							this._timeouts.set(guildChannel, setTimeout(timeout, twelveHours));
							return;
						}
					}, twelveHours);
					return;
				} else if(t.auto_deletion) {
					this._timeouts.set(guildChannel, setTimeout(timeout, twelveHours - (latestMessage.createdTimestamp - t.creation_date.getTime())));
					return;
				}
			}
			this._timeouts.set(guildChannel, setTimeout(timeout, Math.abs((new Date().getTime() - twelveHours) - t.creation_date.getTime())));
			return;
		});

		(await TicketModel.find({ auto_deletion: true, creation_date: { $lte: new Date(new Date().getTime() - (twelveHours * 2)) } })).forEach((t: DocumentType<Ticket>) => {
			console.log({ debug: true, creator: t.creator, time: 2 });
			const guildChannel = client.channels.cache.get(t.channel as string) as GuildChannel;
			TicketModel.deleteTicket(guildChannel);
		});
	}

}