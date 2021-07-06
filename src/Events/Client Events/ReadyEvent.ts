import { EventRun } from "../../Interfaces/Events";
import { Bot } from "../../MineversaClient/MineversaClient";

export const run: EventRun = async(client: Bot) => {
    client.getLogger().log(`${client.user.tag} successfully loaded and now watching over ${client.prettifyNumber(client.users.cache.size)} members`);
}

export const name = 'ready';