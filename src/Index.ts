import { Config } from './Interfaces/Config';
import * as file from './config.json';
import { Bot } from './MineversaClient/MineversaClient';

new Bot().start(file as Config);