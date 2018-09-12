declare function parse(pattern: string, options?: parse.ParseOptions): parse.AST;

declare namespace parse {
    export type AST = Element[]
    export type Element = string | Placeholder
    export type Placeholder = Plural | Styled | Typed | Simple
    export type Plural = [string, 'plural' | 'selectordinal', number, SubMessages]
    export type Styled = [string, string, string | SubMessages]
    export type Typed = [string, string]
    export type Simple = [string]

    export interface SubMessages {
        [key: string]: AST
    }

    export type Token = [TokenType, string]
    export type TokenType = 'text' | 'space' | 'id' | 'type' | 'style' | 'offset' | 'number' | 'selector' | 'syntax'

    export interface ParseOptions {
        tagsType?: string
        tokens?: parse.Token[]
    }


    export class SyntaxError extends Error {
        expected: string | undefined;
        found: string | undefined;
        offset: number;
        line: number;
        column: number;

        constructor(message: string, expected: string | undefined, found: string | undefined, offset: number, line: number, column: number)
    }
}

export = parse;
