declare var Intl: {
  Collator: Class<Collator>,
  DateTimeFormat: Class<DateTimeFormat>,
  NumberFormat: Class<NumberFormat>,
  PluralRules: ?Class<PluralRules>,

  getCanonicalLocales (Locales): Locale[]
}

type Locale = string
type Locales = Locale | Locale[]

declare class Collator {
  constructor (
    locales?: Locales,
    options?: CollatorOptions
  ): Collator;

  static (
    locales?: Locales,
    options?: CollatorOptions
  ): Collator;

  compare (string, string): number;

  resolvedOptions (): {
    locale: Locale,
    usage: 'sort' | 'search',
    sensitivity: 'base' | 'accent' | 'case' | 'variant',
    ignorePunctuation: boolean,
    collation: string,
    numeric: boolean,
    caseFirst?: 'upper' | 'lower' | 'false'
  };

  static supportedLocalesOf (string | string[]): string[];
}

type CollatorOptions = {
  localeMatcher?: 'lookup' | 'best fit',
  usage?: 'sort' | 'search',
  sensitivity?: 'base' | 'accent' | 'case' | 'variant',
  ignorePunctuation?: boolean,
  numeric?: boolean,
  caseFirst?: 'upper' | 'lower' | 'false'
}

declare class DateTimeFormat {
  constructor (
    locales?: Locales,
    options?: DateTimeFormatOptions
  ): DateTimeFormat;

  static (
    locales?: Locales,
    options?: DateTimeFormatOptions
  ): DateTimeFormat;

  format (value?: Date | number): string;

  resolvedOptions (): {
    locale: Locale,
    calendar: string,
    numberingSystem: string,
    timeZone?: string,
    hour12: boolean,
    weekday?: 'narrow' | 'short' | 'long',
    era?: 'narrow' | 'short' | 'long',
    year?: 'numeric' | '2-digit',
    month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
    day?: 'numeric' | '2-digit',
    hour?: 'numeric' | '2-digit',
    minute?: 'numeric' | '2-digit',
    second?: 'numeric' | '2-digit',
    timeZoneName?: 'short' | 'long'
  };

  static supportedLocalesOf (Locales): Locale[];
}

type DateTimeFormatOptions = {
  localeMatcher?: 'lookup' | 'best fit',
  timeZone?: string,
  hour12?: boolean,
  formatMatcher?: 'basic' | 'best fit',
  weekday?: 'narrow' | 'short' | 'long',
  era?: 'narrow' | 'short' | 'long',
  year?: 'numeric' | '2-digit',
  month?: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
  day?: 'numeric' | '2-digit',
  hour?: 'numeric' | '2-digit',
  minute?: 'numeric' | '2-digit',
  second?: 'numeric' | '2-digit',
  timeZoneName?: 'short' | 'long'
}

declare class NumberFormat {
  constructor (
    locales?: Locales,
    options?: NumberFormatOptions
  ): NumberFormat;

  static (
    locales?: Locales,
    options?: NumberFormatOptions
  ): NumberFormat;

  format (number): string;

  resolvedOptions (): {
    locale: Locale,
    numberingSystem: string,
    style: 'decimal' | 'currency' | 'percent',
    currency?: string,
    currencyDisplay?: 'symbol' | 'code' | 'name',
    useGrouping: boolean,
    minimumIntegerDigits?: number,
    minimumFractionDigits?: number,
    maximumFractionDigits?: number,
    minimumSignificantDigits?: number,
    maximumSignificantDigits?: number
  };

  static supportedLocalesOf (Locales): Locale[];
}

type NumberFormatOptions = {
  localeMatcher?: 'lookup' | 'best fit',
  style?: 'decimal' | 'currency' | 'percent',
  currency?: string,
  currencyDisplay?: 'symbol' | 'code' | 'name',
  useGrouping?: boolean,
  minimumIntegerDigits?: number,
  minimumFractionDigits?: number,
  maximumFractionDigits?: number,
  minimumSignificantDigits?: number,
  maximumSignificantDigits?: number
}

declare class PluralRules {
  constructor (
    locales?: Locales,
    options?: PluralRulesOptions
  ): PluralRules;

  select (number): Rule;

  resolvedOptions (): {
    locale: Locale,
    type: 'cardinal' | 'ordinal',
    minimumIntegerDigits?: number,
    minimumFractionDigits?: number,
    maximumFractionDigits?: number,
    minimumSignificantDigits?: number,
    maximumSignificantDigits?: number,
    pluralCategories: Rule[],
  };

  static supportedLocalesOf (Locales): Locale[];
}

type Rule = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

type PluralRulesOptions = {
  localeMatcher?: 'lookup' | 'best fit',
  type?: 'cardinal' | 'ordinal',
  minimumIntegerDigits?: number,
  minimumFractionDigits?: number,
  maximumFractionDigits?: number,
  minimumSignificantDigits?: number,
  maximumSignificantDigits?: number
}
