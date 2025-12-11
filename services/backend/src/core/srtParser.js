const TIME_SEPARATOR = '-->';

function parseTimestamp(raw) {
  const [time] = raw.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const milliseconds = Number(raw.split(',')[1] || 0);
  return ((hours * 60 + minutes) * 60 + seconds) * 1000 + milliseconds;
}

function formatTimestamp(ms) {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const milliseconds = ms % 1000;
  return [hours, minutes, seconds]
    .map((unit) => String(unit).padStart(2, '0'))
    .join(':')
    .concat(',', String(milliseconds).padStart(3, '0'));
}

export function parseSrt(content) {
  if (!content) return [];
  return content
    .split(/\r?\n\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [indexLine, timeLine, ...textLines] = block.split(/\r?\n/);
      const [rawStart, rawEnd] = timeLine.split(TIME_SEPARATOR).map((value) => value.trim());
      return {
        index: Number(indexLine),
        start: parseTimestamp(rawStart),
        end: parseTimestamp(rawEnd),
        text: textLines.join(' '),
      };
    });
}

export function stringifySrt(items) {
  return items
    .map((item) => {
      const start = formatTimestamp(item.start);
      const end = formatTimestamp(item.end);
      const text = Array.isArray(item.text) ? item.text.join('\n') : item.text;
      return `${item.index}\n${start} ${TIME_SEPARATOR} ${end}\n${text}`;
    })
    .join('\n\n');
}
