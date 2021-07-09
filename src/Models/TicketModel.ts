import { prop, getModelForClass } from "@typegoose/typegoose";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { GuildChannel, GuildChannelManager, User } from "discord.js";

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

    static async findTicketByCreatorId(this: ModelType<Ticket>, user: User) {
        const query = await this.find({ creator: user.id });

        return query;
    }

    static async findTicketByChannelId(this: ModelType<Ticket>, channel: GuildChannel) {
        const query = await this.find({ channel: channel.id });

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
            reason: options.reason
        });

        await model.save();
    }

    static async deleteTicket(this: ModelType<Ticket>, channel: GuildChannel) {
        let model = await TicketModel.findTicketByChannelId(channel);

        model[0].delete();
    }
}

export const TicketModel = getModelForClass(Ticket, {
	schemaOptions: { timestamps: true },
});