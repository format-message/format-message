import { Types } from 'format-message-interpret';
import { AST, Placeholder } from 'format-message-parse';

interface Options {
    types: Types
}

declare class MessageFormat {
    format: (args?: object) => string;
    formatToParts: (args?: object) => Placeholder;
    resolvedOptions: () => { locale: string | string[] | undefined };
    supportedLocalesOf: (requestedLocales?: string | string[]) => string[];

    constructor(pattern: string, locales?: string | string[], options?: Options);
}

export = MessageFormat;
