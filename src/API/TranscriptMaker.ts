import { Guild, Message, MessageAttachment, TextChannel } from "discord.js";
import fs from "fs/promises";
import path from "path";
import { Bot } from "../MineversaClient/MineversaClient";

export class TranscriptMaker {

    private _channel: TextChannel;
    private _client: Bot;
    private _guild: Guild;
    private _messages: Array<Message> = new Array();

    public constructor(client: Bot, channel: TextChannel) {
        this._channel = channel;
        this._client = client;
        this._guild = client.guilds.cache.first()
    }

    public async build(): Promise<MessageAttachment> {

        let messages_fetched = 0;
        let last_message;
        
        await this._channel.messages.fetch({
            limit: 100,
        }).then(messages => {
            messages.forEach(message => {
                this._messages.push(message);

                last_message = message.id;
                messages_fetched++;
            });
        });

        while(messages_fetched === 100) {
            console.log(this._channel.id);
            messages_fetched = 0;

            await this._channel.messages.fetch({
                limit: 100,
                before: last_message
            }).then(messages => {
                messages.forEach(message => {
                    this._messages.push(message);

                    last_message = message.id;
                    messages_fetched++;
                });
            });
        }

        this._messages = this._messages.reverse();


        const header: string[] =
            [
                "___  ____                                          ",
                "|  \/  (_)                                         ",
                "| .  . |_ _ __   _____   _____ _ __ __ _ ___  __ _ ",
                "| |\/| | | '_ \ / _ \ \ / / _ \ '__/ _` / __|/ _` |",
                "| |  | | | | | |  __/\ V /  __/ | | (_| \__ \ (_| |",
                "\_|  |_/_|_| |_|\___| \_/ \___|_|  \__,_|___/\__,_|",
                "                                                   ",
                "                                                   ",
                "      _____ _      _        _   _                  ",
                "     |_   _(_)    | |      | | (_)                 ",
                "       | |  _  ___| | _____| |_ _ _ __   __ _      ",
                "       | | | |/ __| |/ / _ \ __| | '_ \ / _` |     ",
                "       | | | | (__|   <  __/ |_| | | | | (_| |     ",
                "       \_/ |_|\___|_|\_\___|\__|_|_| |_|\__, |     ",
                "                                         __/ |     ",
                "                                        |___/      ",
                " ",
                " ",
                " ",
            ];

        const messages: string[] = [];

        this._messages.forEach(async(message) => {
            let formatted_message = `\n`;

            formatted_message = `${formatted_message}[${message.author.username}, ${message.author.tag}]`;
            formatted_message = `${formatted_message} ${message.createdAt.toLocaleString(`en-US`, { timeZone: `PST` })}`;
            formatted_message = `${formatted_message}: ${message.content}`;

            messages.push(formatted_message);
        });

        await fs.writeFile(path.resolve(__dirname, `../../temp/Transcript_${this._channel.id}.txt`), `${header.join(`\n`)}`);
        await fs.appendFile(path.resolve(__dirname, `../../temp/Transcript_${this._channel.id}.txt`), messages.join(``));

        const file = await fs.readFile(path.resolve(__dirname, `../../temp/Transcript_${this._channel.id}.txt`));

        const attachment = new MessageAttachment(file, `Transcript_${this._channel.id}.txt`);

        return attachment;
    }

}