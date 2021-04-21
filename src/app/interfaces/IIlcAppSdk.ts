import { IlcIntl } from '../IlcIntl';

export interface IIlcAppSdk {
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    appId: string;
    intl: IlcIntl;
}
