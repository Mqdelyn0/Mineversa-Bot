import { prop, getModelForClass } from "@typegoose/typegoose";
import { DocumentType, ModelType } from "@typegoose/typegoose/lib/types";
import { GuildChannel, GuildChannelManager, TextChannel, User } from "discord.js";
import { Query } from "mongoose";
import { EmbedBuilder, EmbedFooters } from "../API/EmbedBuilder";
import { TranscriptMaker } from "../API/TranscriptMaker";
import { Bot } from "../MineversaClient/MineversaClient";

export class Ticket {
    @prop({ required: true })
    public channel: String;

    @prop({ required: false, default: true })
    public auto_deletion?: Boolean;

    @prop({ required: false, default: 24 })
    public hours_from_deletion?: Number;

    @prop({ required: false, default: false })
    public read_by_staff?: Boolean;

    @prop({ required: true })
    public creator: String;

    @prop({ required: true })
    public reason: String;

    @prop({ required: false, default: [] })
    public added_users?: String[];

    @prop({ required: false, default: null })
    public creation_date?: Date

    static async findTicketByCreatorId(this: ModelType<Ticket>, user: User) {
        let query;
        if(user.id) query = await this.find({ creator: user.id });

        return query;
    }

    static async findTicketByChannelId(this: ModelType<Ticket>, channel: GuildChannel) {
        let query;
        if(channel.id !== undefined) query = await this.find({ channel: channel.id });

        return query;
    }

    static async addUser(this: ModelType<Ticket>, user: User, channel: GuildChannel): Promise<Boolean> {
        let model = await TicketModel.findTicketByChannelId(channel);
        
        if(!model[0].added_users.includes(user.id)) {
            channel.updateOverwrite(user.id, { VIEW_CHANNEL: true });
            model[0].added_users.push(user.id);
            
            await model[0].save();
            return true;
        }

        return false;
    }

    static async removeUser(this: ModelType<Ticket>, user: User, channel: GuildChannel): Promise<Boolean> {
        let model = await TicketModel.findTicketByChannelId(channel);

        if(model[0].added_users.includes(user.id)) {
            channel.updateOverwrite(user.id, { VIEW_CHANNEL: false });
            model[0].added_users = model[0].added_users.filter(added_user => added_user !== user.id);
                    
            await model[0].save();
            return true;
        }

        return false;
    }

    static async createTicket(this: ModelType<Ticket>, options: Ticket) {
        const model = new this({ 
            added_users: options.added_users,
            auto_deletion: options.auto_deletion,
            channel: options.channel,
            creator: options.creator,
            hours_from_deletion: options.hours_from_deletion,
            read_by_staff: options.read_by_staff,
            reason: options.reason,
            creation_date: new Date(),
        });

        await model.save();
        Bot.getTicketScheduler().refresh();
    }

    static async deleteTicket(this: ModelType<Ticket>, channel: GuildChannel) {
        const model = await TicketModel.findTicketByChannelId(channel);
        const client = Bot.getInstance();

        const author = channel.guild.members.cache.get(model[0].creator);
        const attachment = await (new TranscriptMaker(channel as TextChannel)).build();
        const transcripts_channel = client.channels.cache.get(client.getConfig().transcripts_log) as TextChannel;
        const embed = new EmbedBuilder(`Here's the Transcript Log for ${author.user.tag}'s recent ticket!\nReason: ${model[0].reason}`);
        embed.setAuthor(`Ticket Transcript`, author.user.displayAvatarURL());
        embed.setFooter(EmbedFooters.TICKET);

        transcripts_channel.send(embed.build());
        transcripts_channel.send(attachment);

        channel.delete();
        model[0].delete();
    }
}

export const TicketModel = getModelForClass(Ticket, {
	schemaOptions: { timestamps: true },
});