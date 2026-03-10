const fs = require('fs');
const contentData = JSON.parse(fs.readFileSync('src/content.json', 'utf8'));

const parseChapterRange = (ref) => {
  let cleanRef = ref.toLowerCase().replace(/^(1|2|3|i|ii|iii|first|second|third|1st|2nd|3rd)\s+/, '');
  let chapters = Array.from(cleanRef.matchAll(/(\d+):/g)).map(m => parseInt(m[1], 10));

  if (chapters.length === 0) {
    chapters = Array.from(cleanRef.matchAll(/\b(\d+)\b/g)).map(m => parseInt(m[1], 10));
  }

  if (chapters.length === 0) return null;

  return {
    start: chapters[0],
    end: chapters[chapters.length - 1]
  };
};

const allBooks = contentData.books;
allBooks.forEach(b => {
  if (b.resources && b.resources.length > 0) {
    b.resources.forEach(r => {
      const cleanTitle = r.title.toLowerCase().replace(b.name.toLowerCase(), '').trim();
      const resRange = parseChapterRange(cleanTitle);

      console.log(`Book: [${b.name}] | Title: "${r.title}" | Range: ${resRange ? JSON.stringify(resRange) : 'FULL BOOK'}`);
    });
  }
});
