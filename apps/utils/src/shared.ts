export const obfuscateName = (name: string): string => {
  // Split the name into parts based on spaces
  const parts = name.split(' ');

  const obfuscatePart = (part: string, isFirst: boolean, isLast: boolean): string => {
    if (part.length <= 2) {
      return '*'.repeat(part.length);
    }
    if (isFirst) {
      // Show only the first character of the first part, obfuscate the rest
      const visiblePart = part.charAt(0);
      const obfuscatedPart = '*'.repeat(part.length - 1);
      return `${visiblePart}${obfuscatedPart}`;
    } else if (isLast) {
      // Show only the last character of the last part, obfuscate the rest
      const obfuscatedPart = '*'.repeat(part.length - 1);
      const visiblePart = part.charAt(part.length - 1);
      return `${obfuscatedPart}${visiblePart}`;
    } else {
      // Obfuscate the entire middle part
      return '*'.repeat(part.length);
    }
  }

  // Obfuscate each part, taking into account position (first or last)
  const obfuscatedParts = parts.map((part, index) => {
    return obfuscatePart(part, index === 0, index === parts.length - 1);
  });

  // Join the obfuscated parts back together with spaces
  return obfuscatedParts.join(' ');
}
