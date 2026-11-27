'use strict';

const timeline = document.getElementById('events');
const status = document.getElementById('timeline-status');

function textElement(tag, text) {
  const element = document.createElement(tag);
  element.textContent = text;
  return element;
}

function link(text, url) {
  const element = textElement('a', text);
  element.href = url;
  return element;
}

async function renderTimeline() {
  const response = await fetch('data/events.json');
  if (!response.ok) throw new Error('Timeline unavailable');
  const {events, sources} = await response.json();
  for (const event of events) {
    const row = document.createElement('li');
    row.id = event.id;
    const date = textElement('time', event.period);
    date.dateTime = String(event.year);
    const story = document.createElement('div');
    const evidence = document.createElement('details');
    evidence.append(textElement('summary', 'पुरावे आणि संदर्भ'));
    for (const record of event.evidence) {
      const source = sources[record.source];
      const citation = textElement('p', [source.author, source.title, source.edition, record.locator].join(' · '));
      citation.append(' ', link('संदर्भ उघडा', record.url));
      evidence.append(citation, textElement('small', source.category + ' · ' + record.status));
    }
    story.append(textElement('h3', event.title), textElement('p', event.summary),
      link('ग्रंथातील संबंधित भाग', 'index.html#' + encodeURIComponent(event.chapter)), evidence);
    row.append(date, story);
    timeline.append(row);
  }
  status.hidden = true;
  document.getElementById(location.hash.slice(1))?.scrollIntoView({block: 'center'});
}

renderTimeline().catch(() => {
  status.textContent = 'कालपट सध्या उघडता आला नाही.';
});
