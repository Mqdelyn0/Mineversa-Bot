import { MessageEmbed } from "discord.js";

export class EmbedBuilder {
    
    private _embed: MessageEmbed;
    private _color: EmbedColors = EmbedColors.MAIN;
    private _footer: EmbedFooters = EmbedFooters.DEFAULT;

    public constructor(message: string, title?: string) {
        this._embed = new MessageEmbed();
        this._embed.setDescription(message);
        
        if(title) this._embed.setTitle(title);
    }

    public setColor(color: EmbedColors) {
        this._color = color;
    }

    public setAuthor(title: string, image: string) {
        this._embed.setAuthor(title, image);
    }

    public addField(title: string, value: string, inline: boolean = false) {
        this._embed.addField(title, value, inline);
    }

    public setFooter(footer: EmbedFooters) {
        this._footer = footer;
    }

    public setTimestamp() {
        this._embed.setTimestamp();
    }

    public build(): MessageEmbed {
        this._embed.setColor(this._color);
        this._embed.setFooter(this._footer);

        return this._embed;
    }

}

export enum EmbedColors {
    ERROR = "FF8080",
    SUCCESS = "80FF80",
    MAIN = "00CCCC"
}

export enum EmbedFooters {
    TICKET = "Ticketing » play.mineversa.net",
    SUGGESTION = "Suggestions » play.mineversa.net",
    REACTION_ROLE = "Reaction Roles » play.mineversa.net",
    ECONOMY = "Economy » play.mineversa.net",
    LINKING = "Linking » play.mineversa.net",
    DEFAULT = "Coded by Madelyn » play.mineversa.net"
}