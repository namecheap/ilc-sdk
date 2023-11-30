import { ApplicationConfig } from './AppConfig';

export interface OptionsSdk {
    i18n?: OptionsIntl;
    appConfig?: ApplicationConfig;
}

export interface OptionsIntl {
    manifestPath: string;
}
