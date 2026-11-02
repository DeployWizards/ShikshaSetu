// A4 landscape minus page margins, in CSS px
const PAGE_W = 1047;
const PAGE_H = 718;
const GAP = 32;

// Scale the on-screen charts to fit 2 rows per page, without re-rendering them
function fitToPage() {
  const rootStyle = document.documentElement.style;
  const cards = [...document.querySelectorAll('.grid.lg\\:grid-cols-2 > .print-card')];
  if (!cards.length) {
    rootStyle.removeProperty('--print-width');
    rootStyle.removeProperty('--print-zoom');
    return;
  }

  const width = cards[0].offsetWidth * 2 + GAP;
  const cardH = Math.max(...cards.map((c) => c.offsetHeight));
  const headingH = document.querySelector('.print-root .mb-6')?.offsetHeight ?? 0;
  const height = cardH * 2 + GAP * 3 + headingH;

  rootStyle.setProperty('--print-width', `${width}px`);
  rootStyle.setProperty('--print-zoom', Math.min(PAGE_W / width, PAGE_H / height).toFixed(3));
}

window.addEventListener('beforeprint', fitToPage);

export const printAsPdf = () => window.print();
