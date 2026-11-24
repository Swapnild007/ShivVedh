'use strict';

const digits = new Intl.NumberFormat('mr', { useGrouping: false });
const volumes = document.getElementById('volumes');
const status = document.getElementById('library-status');

function element(tag, className, value) {
  const node = document.createElement(tag);
  node.className = className;
  if (value) node.textContent = value;
  return node;
}

async function renderLibrary() {
  const response = await fetch('manuscript/chapter-map.json');
  if (!response.ok) throw new Error('Chapter map unavailable');
  const plan = await response.json();
  for (const [index, volume] of plan.volumes.entries()) {
    const details = element('details', 'volume');
    details.id = volume.id;
    const summary = document.createElement('summary');
    summary.append(
      element('span', 'volume-mark', 'खंड ' + digits.format(index + 1)),
      element('span', 'volume-title', volume.title),
    );
    const chapters = element('ol', 'chapters');
    chapters.start = volume.chapters[0].number;
    for (const chapter of volume.chapters) {
      const item = document.createElement('li');
      const label = chapter.status === 'source-draft-available' ? 'संपादन सुरू' : 'लेखन बाकी';
      item.append(element('span', 'chapter-title', chapter.title), element('small', 'chapter-status', label));
      if (chapter.readerAnchor) {
        const link = element('a', 'chapter-link', 'सध्याच्या वाचन आवृत्तीतील संबंधित भाग');
        link.href = 'index.html#' + encodeURIComponent(chapter.readerAnchor);
        item.append(link);
      }
      chapters.append(item);
    }
    details.append(summary, chapters);
    volumes.append(details);
  }
  status.hidden = true;
  const requestedVolume = document.getElementById(location.hash.slice(1));
  if (requestedVolume?.classList.contains('volume')) requestedVolume.open = true;
}

renderLibrary().catch(() => {
  status.textContent = 'अनुक्रमणिका सध्या उघडता आली नाही.';
  const link = element('a', 'chapter-link', 'वाचन आवृत्ती उघडा');
  link.href = 'index.html#preface';
  status.append(' ', link);
});
