export interface Config {
    token: string;
    mongo_url: string;
    prefix: string;
    guild: string;
    
    bot_logs: string;

    suggestion_create: string;
    suggestion_result: string;

    support_role: string;
    ticket_category: string;
    transcripts_log: string;
    auto_deletion_warning: Number;
    auto_deletion_timer: Number;

    welcome_bye: string;

    linked_role: string;
    linking_roles: string[];
}