import { Types } from 'format-message-interpret';

type Locale = string
type Locales = Locale | Locale[]
type Message = string | {
    id?: string,
    default: string,
    description?: string
}

interface Translations {
    [key: string]: { [key: string]: string | Translation } | undefined
}

interface Translation {
    message: string,
    format?: (args?: object) => string,
    toParts?: (args?: object) => any[],
}

type Replacement = string | null | undefined | ((a: string, b: string, locales?: Locales) => string | undefined)
type GenerateId = (source: string) => string
type MissingTranslation = 'ignore' | 'warning' | 'error'

interface FormatObject {
    [key: string]: any
}

interface Options {
    locale?: Locales,
    translations?: Translations,
    generateId?: GenerateId,
    missingReplacement?: Replacement,
    missingTranslation?: MissingTranslation,
    formats?: {
        number?: FormatObject,
        date?: FormatObject,
        time?: FormatObject
    },
    types?: Types
}

interface Setup {
    locale: Locales,
    translations: Translations,
    generateId: GenerateId,
    missingReplacement: Replacement,
    missingTranslation: MissingTranslation,
    formats: {
        number: FormatObject,
        date: FormatObject,
        time: FormatObject
    },
    types: Types
}

interface FormatMessage {
    (msg: Message, args?: object, locales?: Locales): string,

    rich(msg: Message, args?: object, locales?: Locales): any[],

    setup(opt?: Options): Setup,

    number(value: number, style?: string, locales?: Locales): string,

    date(value: number | Date, style?: string, locales?: Locales): string,

    time(value: number | Date, style?: string, locales?: Locales): string,

    select(value: any, options: object): any,

    custom(placeholder: any[], locales: Locales, value: any, args: object): any,

    plural(value: number, offset: any, options: any, locale: any): any,

    selectordinal(value: number, offset: any, options: any, locale: any): any,

    namespace(): FormatMessage
}

declare const formatMessage: FormatMessage;
export = formatMessage;
