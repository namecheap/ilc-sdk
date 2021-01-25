import { ServerResponse } from 'http';

import { IlcSdk } from './IlcSdk';
import * as types from './types';

export class IlcAppWrapperSdk extends IlcSdk {
    public forwardRequest(reqData: types.RequestData, res: ServerResponse, data?: types.WrapperResponseData): void {
        if (res.headersSent) {
            throw new Error('Unable to set all necessary headers as they were already sent');
        }

        if (data) {
            res.setHeader('x-props-override', Buffer.from(JSON.stringify(data.propsOverride)).toString('base64'));
        }

        res.statusCode = 210;
        res.end();
    }
}
