import { AST, Placeholder } from 'format-message-parse';

declare function interpret(ast: AST, locale?: interpret.Locales, types?: interpret.Types): (args?: object) => string;

declare namespace interpret {
    export type Locale = string
    export type Locales = Locale | Locale[]
    export type Type = (placeholder: Placeholder, locales: Locales) => (context: any, params?: object) => any

    export interface Types {
        [key: string]: Type
    }

    export function toParts(ast: AST, locale?: Locales, type?: Types): (args?: object) => any[];

    export const types: Types;
}

export = interpret;
