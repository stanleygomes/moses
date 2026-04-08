export class TokenUtil {
  static mask(token: string, maskedLength = 10, visibleTail = 4): string {
    const masked = token.replace(/./g, '*').substring(0, maskedLength);
    const tail = token.slice(-visibleTail);
    return `${masked}... (last ${visibleTail} chars: ${tail})`;
  }
}
