import { Types } from 'format-message-interpret';
import { AST, Placeholder } from 'format-message-parse';

declare class MessageFormat {
    format: (args?: object) => string;
    formatToParts: (args?: object) => Placeholder;
    resolvedOptions: () => { locale: string | string[] | undefined };
    static supportedLocalesOf: (requestedLocales?: string | string[]) => string[];

    constructor(pattern: string, locales?: string | string[], options?: MessageFormat.MessageFormatOptions);
}

declare namespace MessageFormat {
    export interface MessageFormatOptions {
        types: Types
    }
}

export = MessageFormat;
