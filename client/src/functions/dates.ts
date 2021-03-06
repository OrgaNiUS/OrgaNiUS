// Collection of useful helper functions for dates and time.

const milliInHour: number = 1000 * 60 * 60;
const milliInDay: number = milliInHour * 24;
const milliInWeek: number = milliInDay * 7;

const types = ["hour", "day", "week", ""] as const;

/**
 * Converts the milliseconds since 1 January 1970 UTC to hours, days, or weeks.

 * @param millis The milliseconds to be converted.
 * @param type   "hour" for hours, "day" for days, "week" for weeks, "" for no conversion.
 *
 * @returns The converted time.
 */
export const convertTime = (millis: number, type: typeof types[number] = ""): number => {
    switch (type) {
        case "hour":
            return Math.ceil(millis / milliInHour);

        case "day":
            return Math.ceil(millis / milliInDay);

        case "week":
            return Math.ceil(millis / milliInWeek);

        default:
            return millis;
    }
};

/**
 * Gets the difference between 2 dates in a requested type.

 * @param start Start date.
 * @param end   End date.
 * @param type  "hour" for hours, "day" for days, "week" for weeks, "" for no conversion.
 *
 * @returns The difference in the requested type.
 */
export const dateDiff = (start: Date, end: Date, type: typeof types[number] = ""): number => {
    const diff: number = end.getTime() - start.getTime();
    return convertTime(diff, type);
};

/**
 * Returns true if a date is less than `days` days away from now.
 *
 * @param date   The date to be checked.
 * @param period Number of `type` away.
 * @param type   "hour" for hours, "day" for days, "week" for weeks, "" for no conversion.
 *
 * @returns True if date is less than `days` days away from now.
 */
export const isLessThan = (date: Date, period: number, type: typeof types[number] = ""): boolean => {
    const diff: number = dateDiff(new Date(), date, "");

    switch (type) {
        case "hour":
            return diff < period * milliInHour;

        case "day":
            return diff < period * milliInDay;

        case "week":
            return diff < period * milliInWeek;

        default:
            return diff < period;
    }
};

/**
 * Converts Maybe ISO from the server into a maybe Javascript Date object.
 * @param maybeISO Maybe ISO string returned from the server.
 * @returns Maybe Javascript Date object.
 */
export const convertMaybeISO = (maybeISO: string): Date | undefined => {
    if (maybeISO === "1970-01-01T00:00:00Z") {
        return undefined;
    }
    return new Date(maybeISO);
};

/**
 * Gets last day of month.
 * @param month from 1 to 12
 * @returns The last day of the month.
 */
export const lastDayOfMonth = (month: number): number => {
    if (month < 1 || month > 12) {
        return -1;
    }

    const now: Date = new Date();
    // javascript quirk: setting day to 0 gets the last day of previous month
    const lastDay: Date = new Date(now.getFullYear(), month, 0);

    return lastDay.getDate();
};
