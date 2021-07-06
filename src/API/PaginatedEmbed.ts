import { Message, MessageEmbed, MessageReaction, ReactionCollector, ReactionEmoji, User } from "discord.js";

export class PaginatedEmbeds {

    private _embeds: Array<MessageEmbed> = new Array();
    private _emoji_list: Array<string> = new Array();
    private _users: Array<User> = new Array();

    private _collector: ReactionCollector;
    private _message: Message;
    private _timeout: number;
    private _page: number = 0;

    public constructor(embeds: Array<MessageEmbed>, message: Message, user: User, timeout: number = 60000, emoji_list: string[] = [`⬅️`, `➡️`]) {
        this._embeds = embeds;
        this._emoji_list = emoji_list;
        this._message = message;
        this._timeout = timeout;
        this._users.push(user);
    }

    public start() {
        const filter = (reaction: MessageReaction, user: User) => this._emoji_list.includes(reaction.emoji.name) && this._users.includes(user);

        this._message.edit(this._embeds[this._page].setFooter(`Page: ${this._page + 1} / ${this._embeds.length}`))
            .then(message => {
                for(const emoji of this._emoji_list) {
                    message.react(emoji);
                }
            });

        this._collector = this._message.createReactionCollector(
            filter,
            { time: this._timeout }
        )

        this._collector.on('collect', (reaction: MessageReaction) => {
            reaction.users.remove(this._users[0]);
            switch(reaction.emoji.name) {
                case this._emoji_list[0]:
                    this._page = this._page > 0 ? --this._page : this._embeds.length - 1;
                    break;
                case this._emoji_list[1]:
                    this._page = this._page + 1 < this._embeds.length ? ++this._page : 0;
                    break;
                default:
                    break;
            }
            this._message.edit(this._embeds[this._page].setFooter(`Page: ${this._page + 1} / ${this._embeds.length}`));
        });

        this._collector.on('end', () => {
            this._message.edit(this._embeds[this._page].setFooter(`This embed no longer functions.`));
        });
    }

}