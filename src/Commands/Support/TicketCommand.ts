import { GuildChannel, GuildChannelManager, Message, TextChannel, User, } from "discord.js";
import { Bot } from "../../MineversaClient/MineversaClient";
import { CommandRun } from "../../Interfaces/Commands";
import { EmbedBuilder, EmbedColors, EmbedFooters } from "../../API/EmbedBuilder";
import { Emojis } from "../../Interfaces/Emojis";
import { Ticket, TicketModel } from "../../Models/TicketModel";
import { TranscriptMaker } from "../../API/TranscriptMaker";
import { RoleCheck } from "../../API/RoleCheck";
import { DocumentType } from "@typegoose/typegoose";

export const run: CommandRun = async(client: Bot, message: Message, args: string[]): Promise<Boolean> => {

    if(args[0] === "help") {
        let embed = new EmbedBuilder(`You tried to do a ticketing command,\nbut failed. Here's the command list!\n\n\`-ticket create (reason)\`\n\`-ticket delete\`\n\`-ticket add (user|id)\`\n\`-ticket remove (user|id)\`\n\`-ticket deleteall (reason)\`\n\`-ticket evadedeletion (true|false)\`\n\`-ticket answer\``);
        embed.setAuthor(`Ticketing Commands`, message.author.avatarURL());
        embed.setFooter(EmbedFooters.TICKET);

        message.channel.send(embed.build());
        return true;
    } else if(args[0] === "create") {
        let reason = args.splice(1).join(` `);
        if(!reason) reason = "No reason has been defined.";

        const model = await TicketModel.findTicketByCreatorId(message.author);

        if(model[0]) {
            let embed = new EmbedBuilder(`You already have a ticket created!\nVisit the channel here: <#${model[0].channel}>`);
            embed.setAuthor(`Ticketing Error`, message.author.displayAvatarURL());
            embed.setFooter(EmbedFooters.TICKET);

            message.channel.send(embed.build());
            return true;
        }

        message.guild.channels.create(`${Emojis.HEADPHONES}${Emojis.VERTICAL_LINE}waiting-${message.author.username}`, { 
            type: `text`,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: ['VIEW_CHANNEL']
                },
                {
                    id: client.getConfig().support_role,
                    allow: ['VIEW_CHANNEL']
                },
                {
                    id: message.author.id,
                    allow: ['VIEW_CHANNEL']
                }
            ],
            parent: client.getConfig().ticket_category
        }).then(async(channel) => {
            const model: Ticket = {
                channel: channel.id,
                creator: message.member.id,
                reason: reason,
            };
            TicketModel.createTicket(model);

            let embed = new EmbedBuilder(`Your ticket has successfully been created!\nCheck out the channel here:\n<#${channel.id}>`);
            embed.setAuthor(`Ticket Created`, message.author.displayAvatarURL());
            embed.setFooter(EmbedFooters.TICKET);
            
            message.channel.send(embed.build());

            embed.setDescription(`Welcome to your ticket! Support staff will come to help you soon. Briefly describe what you need, and if staff doesn't respond, you may ping them __once__. Close the ticket when your problem is solved!\n\nReason: ${reason}`);
            channel.send(embed.build());
        });
        return true;
    } else if(args[0] === "delete") {
        const model = await TicketModel.findTicketByCreatorId(message.author);

        let embed = new EmbedBuilder(``, ``);
        embed.setAuthor(`Ticket Deletion`, message.author.displayAvatarURL());
        embed.setFooter(EmbedFooters.TICKET);

        if(!model[0]) {
            embed.setDescription(`You don't have a ticket!`);
            message.channel.send(embed.build());

            return true;
        } else if(model[0]) {
            embed.setDescription(`Deleted your ticket!`);
            message.channel.send(embed.build());
                
            const channel = client.channels.cache.get(`${model[0].channel}`) as GuildChannel;

            TicketModel.deleteTicket(channel);
            return true;
        }
    } else if(args[0] === "adduser") {
        const model = await TicketModel.findTicketByChannelId(message.channel as GuildChannel);

        let embed = new EmbedBuilder(``, ``);
        embed.setAuthor(`Ticketing`, message.author.displayAvatarURL());
        embed.setFooter(EmbedFooters.TICKET);

        const user_id = client.getUserIdFromPing(args[1]);
        const user = client.users.cache.get(user_id);

        if(!user) {
            embed.setDescription(`That user could not be found!`);
            message.channel.send(embed.build());

            return true;
        }

        if(!model[0]) {
            embed.setDescription(`You aren't in a ticket!`);
            message.channel.send(embed.build());

            return true;
        }

        const success = await TicketModel.addUser(user, message.channel as GuildChannel);
        if(success) {
            embed.setColor(EmbedColors.SUCCESS);
            embed.setDescription(`Added <@${user.id}> to the ticket!`);

            message.channel.send(embed.build());
            return true;
        } else {
            embed.setColor(EmbedColors.ERROR);
            embed.setDescription(`Couldn't add <@${user.id}> to the ticket!\nMaybe they're already added?`);

            message.channel.send(embed.build());
            return true;
        }
    } else if(args[0] === "removeuser") {
        const model = await TicketModel.findTicketByChannelId(message.channel as GuildChannel);

        let embed = new EmbedBuilder(``, ``);
        embed.setAuthor(`Ticketing`, message.author.displayAvatarURL());
        embed.setFooter(EmbedFooters.TICKET);

        const user_id = client.getUserIdFromPing(args[1]);
        const user = client.users.cache.get(user_id);

        if(!user) {
            embed.setDescription(`That user could not be found!`);
            message.channel.send(embed.build());

            return true;
        }

        if(!model[0]) {
            embed.setDescription(`You aren't in a ticket!`);
            message.channel.send(embed.build());

            return true;
        }

        const success = await TicketModel.removeUser(user, message.channel as GuildChannel);
        if(success) {
            embed.setColor(EmbedColors.SUCCESS);
            embed.setDescription(`Removed <@${user.id}> to the ticket!`);

            message.channel.send(embed.build());
            return true;
        } else {
            embed.setColor(EmbedColors.ERROR);
            embed.setDescription(`Couldn't remove <@${user.id}> to the ticket!\nMaybe they're already removed?`);

            message.channel.send(embed.build());
            return true;
        }
    } else if(args[0] === "deleteall") {
        if(RoleCheck.getResult(message.member, ["Director", "Manager"])) {
            let tickets = await TicketModel.find({ });
            let amountOfTickets = tickets.length;
            let amountOfDeleted = 0;

            let channel;
            for(let ticket of tickets) {
                channel = client.getGuild().channels.cache.get(`${ticket.channel}`);
                let ticketDeleted = TicketModel.deleteTicket(channel as GuildChannel);
                if(ticketDeleted) amountOfDeleted++;
            }

            let embed = new EmbedBuilder(`Tried to delete all tickets!\n\nDeleted ${amountOfDeleted} out of ${amountOfTickets} open tickets.`, ``);
            embed.setColor(EmbedColors.SUCCESS);
            embed.setAuthor(`Ticketing`, message.author.avatarURL());
            embed.setFooter(EmbedFooters.TICKET);

            message.channel.send(embed.build());
        } else {
            let embed = new EmbedBuilder(`You don't have permission to do this!\n\nYou need one of the roles:\nDirector, Manager`, ``);
            embed.setColor(EmbedColors.ERROR);
            embed.setAuthor(`No Permission`, message.author.avatarURL());

            message.channel.send(embed.build());
        }
        return true;
    } else if(args[0] === "evadedeletion") {
        if((message.channel as GuildChannel).parentID !== client.getConfig().ticket_category) {
            const embed = new EmbedBuilder(`You must be in a ticket to run this command.`);
            embed.setColor(EmbedColors.ERROR);
            message.channel.send(embed.build());
            return;
        }
        const ticket = (await TicketModel.findTicketByChannelId(message.channel as GuildChannel))[0];
        ticket.auto_deletion = false;
        ticket.updateOne(ticket);
        ticket.save();

        const embed = new EmbedBuilder(`This ticket is ${ticket.auto_deletion ? 'now susceptible' : 'no longer suspectible'} to auto-deletion from inactivity.`);
        embed.setColor(EmbedColors.SUCCESS);
        embed.setFooter(EmbedFooters.TICKET);
        message.channel.send(embed.build());
        return true;
    } else if(args[0] === "answer") {
        if(RoleCheck.getResult(message.member, ["Support"])) {
            const guildChannel = message.channel as GuildChannel;
            if(guildChannel.parentID !== client.getConfig().ticket_category) {
                const embed = new EmbedBuilder(`You must be in a ticket to run this command.`);
                embed.setColor(EmbedColors.ERROR);
                message.channel.send(embed.build());
                return;
            }
            const ticket = (await TicketModel.findTicketByChannelId(message.channel as GuildChannel))[0];
            const creator = client.users.cache.get(ticket.creator as string);
            guildChannel.setName(`🎧︱responded-${creator.username}`);
            const embed = new EmbedBuilder(`Ticket marked as responded.`);
            embed.setColor(EmbedColors.SUCCESS);
            message.channel.send(embed.build());
            return true;
        } else {
            let embed = new EmbedBuilder(`You don't have permission to do this!\n\nYou need one of the roles:\nSupport`, ``);
            embed.setColor(EmbedColors.ERROR);
            embed.setAuthor(`No Permission`, message.author.avatarURL());

            message.channel.send(embed.build());
            return true;
        }
    }

    return false;
}

export const name = 'ticket';
export const aliases = ['ticketing', 't'];
export const min_args = 1;
export const category = `💻  Support`;
export const help_cmd = `-ticket help`;