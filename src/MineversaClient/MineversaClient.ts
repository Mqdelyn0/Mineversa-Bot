import consola, { Consola } from 'consola';
import { Client, Intents, Collection } from 'discord.js';
import { promisify } from 'util';
import { Command } from '../Interfaces/Commands';
import { Event } from '../Interfaces/Events';
import { Config } from '../Interfaces/Config';

import glob from 'glob';
import { Connection } from 'mongoose';
import mongoose from 'mongoose';

const glob_promise = promisify(glob);

class Bot extends Client {

    private logger: Consola = consola;
    private config: Config;
    private commands: Collection<string, Command> = new Collection();
    private events: Collection<string, Event> = new Collection();
    private mongo: Connection;

    public constructor() {
        super({ ws: { intents: Intents.ALL}, 
            messageCacheLifetime: 300,
            messageCacheMaxSize: 500,
            messageEditHistoryMaxSize: 500,
            disableMentions: `everyone`
        });

        // const connection = mongoose.createConnection(this.getConfig());
    }

    public async start(config: Config): Promise<void> {
        this.config = config;
        super.login(config.token);

        const command_files: string[] = await glob_promise(`${__dirname}/../Commands/**/*{.ts,.js}`);
        let valid_command = true;
        let errors = [];
        command_files.map(async(command: string) => {
            const file: Command = await import(command);
            const command_name = command.replace(`.ts`, ``).replace(`.js`, ``).split(`/`).splice(8);

            // Make sure the Command is a valid Command
            if(file.name === undefined) {
                valid_command = false;
                errors.push(`No Name Set`);
            }

            if(file.run === undefined) {
                valid_command = false;
                errors.push(`No Run Method`);
            }

            if(file.category === undefined) {
                valid_command = false;
                errors.push(`No Category Set`);
            }

            if(file.help_cmd === undefined) {
                valid_command = false;
                errors.push(`No Help CMD Set`);
            }

            if(valid_command) {
                this.events.set(file.name, file);

                if(file.aliases) {
                    file.aliases.forEach(alias => {
                        this.getCommands().set(alias, file);
                        this.getLogger().log(`Successfully loaded alias ${alias} for ${command_name}`);
                    });
                }

                this.getCommands().set(file.name, file);
                this.getLogger().log(`Successfully loaded command ${command_name}`);
            } else if (!valid_command) {
                this.getLogger().error(`Unable to load command ${command_name}\n${errors.join(`\n`)}`);
            }
            
            valid_command = true;
            errors = [];
        });

        const event_files: string[] = await glob_promise(`${__dirname}/../Events/**/*{.ts,.js}`);
        let valid_event = true;
        errors = [];
        event_files.map(async(event: string) => {
            const file: Event = await import(event);
            const event_name = event.replace(`.ts`, ``).replace(`.js`, ``).split(`/`).splice(8);

            // Make sure the Event is a valid Event
            if(file.name === undefined) {
                valid_event = false;
                errors.push(`No Name Set`);
            }

            if(file.run === undefined) {
                valid_event = false;
                errors.push(`No Run Method`);
            }

            if(valid_event) {
                this.events.set(file.name, file);
                this.on(file.name, file.run.bind(null, this));
                this.getLogger().log(`Successfully loaded event ${event_name}`);
            } else if (!valid_event) {
                this.getLogger().error(`Unable to load event ${event_name}\n${errors.join(`\n`)}`);
            }
            valid_event = true;
            errors = [];
        });
    }

    public getLogger(): Consola {
        return this.logger;
    }

    public getConfig(): Config {
        return this.config;
    }

    public getCommands(): Collection<string, Command> {
        return this.commands;
    }

    public prettifyNumber(num: number): String {
        return num.toLocaleString(`en-US`, {maximumFractionDigits:2})
    }

}

export { Bot };