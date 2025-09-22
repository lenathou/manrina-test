export const htmlToPlainText = (value: string): string => {
    if (!value) {
        return '';
    }

    const entityMap: Record<string, string> = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&eacute;': '\u00e9',
        '&egrave;': '\u00e8',
        '&ecirc;': '\u00ea',
        '&agrave;': '\u00e0',
        '&ccedil;': '\u00e7',
        '&ocirc;': '\u00f4',
        '&ucirc;': '\u00fb',
        '&icirc;': '\u00ee',
        '&iuml;': '\u00ef',
        '&ugrave;': '\u00f9',
        '&ouml;': '\u00f6',
        '&hellip;': '\u2026',
        '&ndash;': '-',
        '&rsquo;': '\u2019',
        '&lsquo;': '\u2018',
        '&ldquo;': '\u201c',
        '&rdquo;': '\u201d',
    };

    const withLineBreaks = value
        .replace(/<br\s*\?>/gi, '\n')
        .replace(/<\/(p|div|section|article|header|footer|h[1-6])>/gi, '\n\n')
        .replace(/<li>/gi, '\n- ')
        .replace(/<\/(li|ul|ol)>/gi, '\n');

    const withoutTags = withLineBreaks.replace(/<[^>]*>/g, '');

    const decoded = withoutTags.replace(/&[a-zA-Z]+;|&#\d+;|&#x[0-9a-fA-F]+;/g, (entity) => {
        if (entity in entityMap) {
            return entityMap[entity as keyof typeof entityMap];
        }

        if (/^&#x[0-9a-fA-F]+;$/i.test(entity)) {
            const hexValue = entity.slice(3, -1);
            const codePoint = parseInt(hexValue, 16);
            if (!Number.isNaN(codePoint)) {
                try {
                    return String.fromCodePoint(codePoint);
                } catch (_error) {
                    return entity;
                }
            }
        }

        const numericMatch = entity.match(/&#(\d+);/);
        if (numericMatch) {
            const codePoint = Number(numericMatch[1]);
            if (!Number.isNaN(codePoint)) {
                try {
                    return String.fromCodePoint(codePoint);
                } catch (_error) {
                    return entity;
                }
            }
        }

        return entity;
    });

    return decoded
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+\n/g, '\n')
        .trim();
};
