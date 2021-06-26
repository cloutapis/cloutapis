export class TypeHelper {
    public static isNumber(value: any) {
        return !isNaN(value) && !isNaN(parseFloat(value));
    }

    public static isString(p_value: any, p_checkEmpty = true): boolean {
        return (typeof p_value === 'string' || p_value instanceof String) &&
            (!p_checkEmpty || p_value?.length > 0);
    }
}