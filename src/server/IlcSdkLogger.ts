/**
 * A lightweight interface for ilc sdk logging purpose.
 * Useful when server-side has requirements for log format, and default console calls would not suite that requirements.
 */
export interface IlcSdkLogger {
    warn(message: string, error?: Error): void;

    error(message: string, error?: Error): void;
}
