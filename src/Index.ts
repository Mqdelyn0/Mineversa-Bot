import { Config } from './Interfaces/Config';
import * as file from './config.json';
import { Bot } from './MineversaClient/MineversaClient';
import mongoose, { Connection } from 'mongoose';

(async() => {
    const config = file as Config;
    const connection = await mongoose.connect(config.mongo_url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }) as unknown as Connection;

    new Bot().start(config, connection);
})();