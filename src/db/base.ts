import { NotImplementedError } from '../error';
import { DbConnectorOptions } from '../interfaces';

export default abstract class BaseConnector {
    public constructor(options: DbConnectorOptions = {}) {
        for (const [key, value] of Object.entries(options)) {
            if (this.hasOwnProperty(key)) {
                this[key] = value;
            }
        }

        this.close = this.close.bind(this);
        this.connect = this.connect.bind(this);
    }

    public close(): Promise<undefined> {
        throw new NotImplementedError();
    }

    public connect(): Promise<undefined> {
        throw new NotImplementedError();
    }
}