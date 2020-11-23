import avro from 'avsc';
import {RoutingStrategy} from '../app/commonTypes';

const IlcProtocol = avro.Type.forSchema({
    type: 'record',
    name: 'IntlConfig',
    fields: [
        {name: 'locale', type: 'string'},
        {name: 'currency', type: 'string'},
    ]
});


export const intlSchema = avro.Type.forSchema({
    type: 'record',
    name: 'root',
    fields: [
        {
            name: 'current',
            type: IlcProtocol
        },
        {
            name: 'default',
            type: IlcProtocol
        },
        {
            name: 'supported',
            type: {
                type: 'record',
                name: 'supported',
                fields: [
                    {name: 'locale', type: {type: 'array', items: 'string'}},
                    {name: 'currency', type: {type: 'array', items: 'string'}},
                ]
            }
        },
        {
            name: 'routingStrategy',
            type: {
                type: 'enum',
                name: 'routingStrategy',
                symbols: Object.values(RoutingStrategy)
            }
        }
    ],
});