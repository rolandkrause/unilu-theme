// Report slides whose content runs past the slide bottom, and code output
// whose lines wrap because they are wider than their column.
//
// Usage: node tools/check_slides.js <url> [--all]
//   <url>   a rendered deck served over http (not file://), e.g.
//           python3 -m http.server 8000 --directory _site
//           node tools/check_slides.js http://localhost:8000/slides/import.html
//   --all   list every slide with code output, not only problems
//
// Needs puppeteer-core (npm install --prefix tools) and Chrome; set
// CHROME_PATH if Chrome isn't in its default macOS location.

const puppeteer = require('puppeteer-core');

const chrome = process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const [url, flag] = process.argv.slice(2);
if (!url) {
  console.error('Usage: node tools/check_slides.js <url> [--all]');
  process.exit(2);
}

(async () => {
  const browser = await puppeteer.launch({executablePath: chrome, headless: 'new'});
  const page = await browser.newPage();
  await page.setViewport({width: 1600, height: 900});
  await page.goto(url, {waitUntil: 'networkidle0'});
  await page.waitForFunction(() => window.Reveal && Reveal.isReady());

  const n = await page.evaluate(() => Reveal.getSlides().length);
  let problems = 0;
  for (let i = 0; i < n; i++) {
    const r = await page.evaluate((i) => {
      // `#` sections hold `##` slides as vertical children: navigate by indices
      const ix = Reveal.getIndices(Reveal.getSlides()[i]);
      Reveal.slide(ix.h, ix.v);
      document.querySelectorAll('.fragment').forEach(f => f.classList.add('visible'));
      // .present is set on the section group and its slide: the last one is the slide
      const slide = [...document.querySelectorAll('.reveal .slides section.present')].pop();
      const heading = slide.querySelector('h1, h2, h3, h4');
      const scale = Reveal.getScale();
      const outputs = [...slide.querySelectorAll('.cell-output pre code')].map(code => {
        const cs = getComputedStyle(code);
        const probe = document.createElement('span');
        probe.textContent = 'x'.repeat(100);
        code.appendChild(probe);
        const charWidth = probe.getBoundingClientRect().width / 100 / scale;
        probe.remove();
        const lines = code.textContent.replace(/\n$/, '').split('\n');
        // trailing spaces (tibble pads its columns) hang without wrapping
        const longest = Math.max(...lines.map(l => [...l.trimEnd()].length));
        const inner = code.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        // count rendered lines from the text's layout boxes, which the
        // output box's max-height doesn't clip
        const range = document.createRange();
        range.selectNodeContents(code);
        const tops = new Set([...range.getClientRects()].map(b => Math.round(b.top / scale)));
        return {
          longest,
          fits: Math.floor(inner / charWidth),
          wrapped: tops.size - lines.length,
          // lines without spaces can't wrap and run past the column instead
          clipped: code.scrollWidth > code.clientWidth + 1,
        };
      });
      return {
        title: heading ? heading.textContent.trim() : '(no title)',
        overflow: slide.scrollHeight - slide.clientHeight,
        outputs,
      };
    }, i);

    const wide = r.outputs.filter(o => o.wrapped > 0 || o.clipped);
    const bad = r.overflow > 0 || wide.length > 0;
    if (bad) problems++;
    if (bad || (flag === '--all' && r.outputs.length)) {
      const parts = [];
      if (r.overflow > 0) parts.push(`${r.overflow} px past the bottom`);
      for (const o of r.outputs) {
        let note = '';
        if (o.wrapped > 0) note = ` (${o.wrapped} wrapped lines)`;
        else if (o.clipped) note = ' (runs past the column)';
        parts.push(`output ${o.longest}/${o.fits} chars${note}`);
      }
      console.log(`${i + 1}\t${r.title}: ${parts.join(', ')}`);
    }
  }
  await browser.close();
  console.log(`${problems} slide(s) with problems out of ${n}`);
  process.exit(problems ? 1 : 0);
})();
