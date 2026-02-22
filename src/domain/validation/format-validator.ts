export class FormatValidator {
    private static readonly UUID_REGEX =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    static isValidUuid(id: string): boolean {
        return this.UUID_REGEX.test(id);
    }

    static isValidEmail(email: string): boolean {
        return this.EMAIL_REGEX.test(email);
    }
}
