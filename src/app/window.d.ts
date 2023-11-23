import type { LifeCycles, MountParcel, IntlAdapter, AppStatus } from './types';

declare global {
    interface Window {
        ILC: {
            loadApp: (name: string, options?: { injectGlobalCss?: boolean }) => Promise<LifeCycles>;
            navigate: (url: string) => void;
            onIntlChange: (handler: (intlValues: { locale: string; currency: string }) => any) => void;
            onRouteChange: (
                handler: (
                    event: CustomEvent<{
                        originalEvent: PopStateEvent;
                        newAppStatuses: Record<string, AppStatus>;
                        appsByNewStatus: Partial<Record<AppStatus, string[]>>;
                        totalAppChanges: number;
                    }>,
                    ilcEvent: CustomEvent<{ basePath: string; reqUrl: string }>,
                ) => any,
            ) => () => void;
            matchCurrentRoute: (url: string) => boolean;
            mountRootParcel: MountParcel;
            importParcelFromApp<ExtraProps = {}>(
                appName: string,
                parcelName: string,
            ): Promise<LifeCycles<ParcelLifecycleFnProps<ExtraProps>>>;
            getIntlAdapter: () => IntlAdapter | null;
            getAllSharedLibNames: GetAllSharedLibNames;
            getSharedLibConfigByName: (name: string) => Promise<string[]>;
            getSharedLibConfigByNameSync: (name: string) => string[];
        };
    }
}

export {};
