# Quarto reveal.js uni.lu template


![Build](https://github.com/ginolhac/unilu-theme/actions/workflows/publish.yml/badge.svg)

A [Quarto](https://quarto.org) extension for authoring [r-training](https://gitlab.com/uniluxembourg/lcsb/r-training) Reveal.js presentations at [University of Luxembourg](https://wwwen.uni.lu/)

Fontawesome is used for icons in callout boxes.

## Installation

- To start a new presentation in a new folder:

``` bash
quarto use template ginolhac/unilu-theme
quarto add quarto-ext/fontawesome --embed ginolhac/unilu-theme
```

- To install the theme in an existing folder:

``` bash
quarto install extension ginolhac/unilu-theme
quarto add quarto-ext/fontawesome --embed ginolhac/unilu-theme
```

## Title slide logo

Each deck's own logo sits in a circular badge to the left of the title. Set only `data-background-image` in `title-slide-attributes`:

``` yaml
title-slide-attributes:
  data-background-image: https://tidyverse.tidyverse.org/logo.png
```

Position and size are fixed by the theme itself (`$title-logo-x`/`$title-logo-y`/`$title-logo-size` in `lectures.scss`), so a per-document `data-background-position` or `data-background-size` has no effect.

## Linked logo

Following discussion on [quarto-cli](https://github.com/quarto-dev/quarto-cli/discussions/3082#discussioncomment-7058099), logo on each slide can point to the desired URL.

Set it in the YAML header with `logo_url: "https://fasterthanli.me"`

If not set, it points to https://quarto.org


## Output

![template preview](template.png)

Preview this [Quarto reveal.js theme](https://rolandkrause.github.io/unilu-theme) on `gh-pages`.

## Styling and usage

Ideas for the use of the slide styling is in the template.

## Code output width

Code output is set in 22 px monospace (Fira Mono if installed, otherwise the system's monospace font; both are about 13.25 px per character) with `white-space: pre-wrap`. Output lines longer than their column wrap at the last space that fits, which breaks tables apart; a line without spaces runs past the column edge instead. Output boxes are at most 650 px high (`code-block-height`, about 20 lines) and scroll beyond that, which hides the last rows and the footer.

Characters that fit on one line, measured in a deck with two columns side by side:

| Column | Characters | `options(width = )` |
|---|---|---|
| full slide | 120 | 120 |
| 70% | 82 | 82 |
| 60% | 70 | 70 |
| 50%, or `output-location: column` | 58 | 58 |
| 40% | 46 | 46 |
| 30% | 33 | 33 |

### Which R option to set

- `width` is the line length for tibble and base R printing, the tibble footer (`# ℹ 12 more variables: …`), and cli messages and errors. Without it, R uses 80, which wraps in any column narrower than 70%.
- `pillar.width` sets only the width of a tibble. When it's larger than `width`, the tibble's columns are printed in stacked blocks. Leave it unset unless that's the intent.
- cli's `ℹ` hint lines (e.g. readr's `Use spec() …`) follow neither option. Hide them with `show_col_types = FALSE` or `#| message: false`.
- `pillar.max_footer_lines = 2` cuts the footer of a wide tibble to two lines ending in `…`.
- More than about 15 rows overflow the output box: show `head()` or `tail()`.
- Python output doesn't follow R options.

### Setting it in a deck

Set the width once in the setup chunk, for the column width that holds most of the deck's output, e.g. `options(width = 58)` for two 50% columns. To change it for one or more slides, put hidden chunks around them and restore with `options(op)`, so the deck's value is set in one place only:

````markdown
```{r}
#| include: false
op <- options(width = 120)
```

## Full-width slide

```{r}
#| include: false
options(op)
```
````

### Checking a rendered deck

`tools/check_slides.js` opens a rendered deck in Chrome, steps through every slide with all fragments shown, and lists the slides whose content runs past the bottom and the outputs whose lines wrap or run past their column. Reading the source is not enough: column layouts and `output-location` decide the width.

``` bash
npm install --prefix tools
python3 -m http.server 8000 --directory _site &
node tools/check_slides.js http://localhost:8000/slides/deck.html
```

Add `--all` to list every slide with output, with its longest line and the characters that fit. Set `CHROME_PATH` if Chrome isn't in `/Applications`.


## Acknowledgements

-   [Romain Lesur](https://github.com/RLesur) for the [onyxia-quarto template](https://github.com/InseeFrLab/onyxia-quarto) 
-   [Mickaël Canouil](https://github.com/mcanouil/) for maintaining the [awesome Quarto](https://github.com/mcanouil/awesome-quarto)
-   [Emi Tanaka](https://github.com/emitanaka) for her [syntax-highlthing CSS](https://github.com/emitanaka/talks/blob/master/Ihaka2022/assets/syntax-highlight.css)

## License

MIT License
