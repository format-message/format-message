interface Format {
    [option: string]: any
}

interface FormatGroup {
    default: Format,

    [style: string]: Format
}

export declare const number: FormatGroup;
export declare const date: FormatGroup;
export declare const time: FormatGroup;
export declare const duration: FormatGroup;

export declare function parseNumberPattern(pattern: string | undefined): Format;

export declare function parseDatePattern(pattern: string): Format;
