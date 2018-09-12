export interface FormatGroup<T> {
    default: T

    [style: string]: T
}

export interface DurationFormatOptions {
    hours: Intl.NumberFormatOptions
    minutes: Intl.NumberFormatOptions
    seconds: Intl.NumberFormatOptions
}

export declare const number: FormatGroup<Intl.NumberFormatOptions>;
export declare const date: FormatGroup<Intl.DateTimeFormatOptions>;
export declare const time: FormatGroup<Intl.DateTimeFormatOptions>;
export declare const duration: FormatGroup<DurationFormatOptions>;

export declare function parseNumberPattern(pattern: string | undefined): Intl.NumberFormatOptions;

export declare function parseDatePattern(pattern: string): Intl.DateTimeFormatOptions;
