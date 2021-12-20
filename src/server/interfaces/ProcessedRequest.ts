import * as types from '../types';
import { ServerResponse } from 'http';
import AppSdk from '../../app';

export interface ProcessedRequest<RegistryProps = unknown> {
    requestData: types.RequestData<RegistryProps>;
    appSdk: AppSdk;
    processResponse: (res: ServerResponse, data?: types.ResponseData) => void;
}
