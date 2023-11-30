import { ApplicationConfig } from './AppConfig';

export interface OptionsSdk {
    i18n?: OptionsIntl;
    manifest?: ApplicationConfig;
}

export interface OptionsIntl {
    manifestPath: string;
}
