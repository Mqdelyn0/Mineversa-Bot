import { Bot } from "../MineversaClient/MineversaClient";

export interface EventRun {
    (client: Bot,
    ...args: any[]): Promise<void>;
}

export interface Event {
    name?: string | undefined;
    run?: EventRun | undefined;
}