export interface Config {
    token: string;
    mongo_url: string;
    prefix: string;
    guild: string;
    
    bot_logs: string;

    suggestion_create: string;
    suggestion_result: string;

    welcome_bye: string,

    linked_role: string;
    linking_roles: string[];
}