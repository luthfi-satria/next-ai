export const countWords = (text: string) => text.split(/\s+/).filter(word => word.length > 0).length;
export const countChars = (text: string) => text.length;
