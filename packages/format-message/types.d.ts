import { Types } from 'format-message-interpret';

declare function formatMessage(msg: formatMessage.Message, args?: object, locales?: formatMessage.Locales): string

declare namespace formatMessage {
    export type Locale = string
    export type Locales = Locale | Locale[]

    export interface MessageObject {
        id?: string
        default: string
        description?: string
    }

    export type Message = string | MessageObject

    export interface Translations {
        [key: string]: { [key: string]: string | Translation } | undefined
    }

    export interface Translation {
        message: string
        format?: (args?: object) => string
        toParts?: (args?: object) => any[]
    }

    type ReplacementFunction = ((a: string, b: string, locales?: Locales) => string | undefined)

    export type Replacement = string | null | undefined | ReplacementFunction

    export type GenerateId = (source: string) => string

    export type MissingTranslation = 'ignore' | 'warning' | 'error'

    export interface FormatObject {
        [key: string]: any
    }

    export interface SetupOptions {
        locale?: Locales
        translations?: Translations
        generateId?: GenerateId
        missingReplacement?: Replacement
        missingTranslation?: MissingTranslation
        formats?: {
            number?: FormatObject
            date?: FormatObject
            time?: FormatObject
        },
        types?: Types
    }

    export interface Setup {
        locale: Locales
        translations: Translations
        generateId: GenerateId
        missingReplacement: Replacement
        missingTranslation: MissingTranslation
        formats: {
            number: FormatObject
            date: FormatObject
            time: FormatObject
        },
        types: Types
    }

    export function rich(msg: Message, args?: object, locales?: Locales): any[]

    export function setup(opt?: SetupOptions): Setup

    export function number(value: number, style?: string, locales?: Locales): string

    export function date(value: number | Date, style?: string, locales?: Locales): string

    export function time(value: number | Date, style?: string, locales?: Locales): string

    export function select(value: any, options: object): any

    export function custom(placeholder: any[], locales: Locales, value: any, args: object): any

    export function plural(value: number, offset: any, options: any, locale: any): any

    export function selectordinal(value: number, offset: any, options: any, locale: any): any

    export function namespace(): typeof formatMessage
}

export = formatMessage
