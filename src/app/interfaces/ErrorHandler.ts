/**
 * Allows to handle uncaught app/parcel errors.
 * For apps it will be passed by ILC and handled centrally.
 * For parcels it may be passed by Parcel component and handled there.
 */
export type ErrorHandler = (error: Error, errorInfo?: Record<string, any>) => void;
