import { IlcIntl } from '../IlcIntl';
import { Render404 } from '../interfaces/common';

export interface IIlcAppSdk {
    /** Unique application ID, if same app will be rendered twice on a page - it will get different IDs */
    appId: string;
    intl: IlcIntl;
    render404: Render404;
    cssBundle?: string;
}
