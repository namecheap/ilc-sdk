export interface ApplicationConfig<T = object> {
    name: string;
    kind: ApplicationKind;
    spaBundle?: string;
    cssBundle?: string;
    l10nManifest?: string;
    wrappedWith?: string;
    props?: T;
    dependencies?: Record<string, string>;
}

export enum ApplicationKind {
    Regular = 'regular',
    Primary = 'primary',
    Essential = 'essential',
    Wrapper = 'wrapper',
}
