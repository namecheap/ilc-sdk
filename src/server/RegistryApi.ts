import urljoin from 'url-join';
import axios from 'axios';
import memoizee from 'memoizee';

type DiscoveryMetadata = Record<string, any>;

type ListDiscoveredApps = {
    name: string;
    discoveryMetadata: DiscoveryMetadata;
}[];

type Options = {
    logger?: Console;
    maxAgeMillisecondsOfGetApps?: number;
};

/**
 * Class RegistryApi provides capabilities to work with ILC Registry, e.g. retrieve some data etc.
 */
export class RegistryApi {
    private log: Console;
    private _lastRetrievedApps?: ListDiscoveredApps;

    /**
     * @param registryOrigin ILC registry origin. e.g "http://localhost:4001/"
     *
     * @param options
     * @param options.logger
     *
     *   **Default value:** `console`
     *
     * @param options.maxAgeMillisecondsOfGetApps Cache timeout (milliseconds) is used for retrieving apps from ILC Registry.
     *
     *   **Default value:** `60000`
     */
    constructor(private registryOrigin: string, options: Options = {}) {
        this.log = options.logger || console;

        this.getApps = memoizee(this.getApps.bind(this), {
            maxAge: options.maxAgeMillisecondsOfGetApps || 60000,
        });
    }

    /**
     * Retrieve list of app names from ILC Registry, filtered with provided query by "discoveryMetadata" fields
     * If provided e.g. 2 items in query - will be returned only apps which contains both item at once.
     */
    public async discoverApps(query?: DiscoveryMetadata): Promise<ListDiscoveredApps> {
        let apps = await this.getApps();

        if (query) {
            apps = apps.filter((app) => {
                if (!app.discoveryMetadata || !Object.keys(app.discoveryMetadata).length) {
                    return false;
                }

                for (const [key, value] of Object.entries(query)) {
                    // if app doesn't have at least one query field then remove it from result
                    if (app.discoveryMetadata[key] !== value) {
                        return false;
                    }
                }

                return true;
            });
        }

        return apps;
    }

    /**
     * Memoized method via constructor of the Class for 60 seconds by default.
     * Returns list of all apps with only "name" and "discoveryMetadata" field.
     */
    private async getApps(): Promise<ListDiscoveredApps> {
        const url = urljoin(this.registryOrigin, '/api/v1/external/apps_by_metadata');

        let list: ListDiscoveredApps;
        try {
            const { data } = await axios.get(url);
            list = data;
            this._lastRetrievedApps = list;
        } catch (e) {
            if (this._lastRetrievedApps) {
                this.log.warn(`ILC registry (${url}) isn't available, so returned previously retrieved apps.`, e);
                list = this._lastRetrievedApps;
            } else {
                throw e;
            }
        }

        return list;
    }
}
