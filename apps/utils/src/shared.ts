export const obfuscateName = (name: string): string => {
  if (name.length <= 2) {
    return '*'.repeat(name.length);
  }
  const firstChar = name.charAt(0);
  const lastChar = name.charAt(name.length - 1);
  const middle = '*'.repeat(name.length - 2);
  return `${firstChar} ${middle} ${lastChar}`;
}

