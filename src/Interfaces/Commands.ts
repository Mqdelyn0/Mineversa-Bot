import { Bot } from "../MineversaClient/MineversaClient";
import { Message } from "discord.js";

export interface CommandRun {
    (client: Bot,
    message: Message,
    args: string[],
    raw: string): Promise<Boolean>;
}

export interface Command {
    name?: string | undefined;
    aliases?: string[] | undefined;
    min_args?: number | undefined;
    max_args?: number | undefined;
    req_roles?: string[] | undefined;
    category?: string | undefined;
    description?: string| undefined;
    help_cmd?: string | undefined;
    run?: CommandRun | undefined;
}