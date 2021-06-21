export class TypeHelper {
    public static isNumber(value: any) {
        return !isNaN(value) && !isNaN(parseFloat(value));
    }
}