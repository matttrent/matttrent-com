---
title: 2024 summer quarterly
date: 2024-09-21
isDraft: false
---

Did some stuff

<p>Tufte emphasizes tight integration of graphics with text. Data, graphs, and figures are kept with the text that discusses them. In print, this means they are not relegated to a separate page. On the web, that means readability of graphics and their accompanying text without extra clicks, tab-switching, or scrolling.</p>
<p>Figures should try to use the <code>figure</code> element, which by default are constrained to the main column. Don’t wrap figures in a paragraph tag. Any label or margin note goes in a regular margin note inside the figure. For example, most of the time one should introduce a figure directly into the main flow of discussion, like so:</p>

<figure>
  <label for="mn-exports-imports" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="mn-exports-imports" class="margin-toggle"/>
  <span class="marginnote">From Edward Tufte, <em>Visual Display of Quantitative Information</em>, page 92.</span>
  <img src="https://edwardtufte.github.io/tufte-css/img/exports-imports.png" alt="Exports and Imports to and from Denmark & Norway from 1700 to 1780" />
</figure>

<p>
  <label for="mn-figure-1" class="margin-toggle">&#8853;</label>
  <input type="checkbox" id="mn-figure-1" class="margin-toggle"/>
  <span class="marginnote">
    <img src="https://edwardtufte.github.io/tufte-css/img/rhino.png" alt="Image of a Rhinoceros"/>
    F.J. Cole, “The History of Albrecht Dürer’s Rhinoceros in Zooological Literature,” <em>Science, Medicine, and History: Essays on the Evolution of Scientific Thought and Medical Practice</em> (London, 1953), ed. E. Ashworth Underwood, 337-356. From page 71 of Edward Tufte’s <em>Visual Explanations</em>.
  </span>
  But tight integration of graphics with text is central to Tufte’s work even when those graphics are ancillary to the main body of a text. In many of those cases, a margin figure may be most appropriate. To place figures in the margin, just wrap an image (or whatever) in a margin note inside a <code>p</code> tag, as seen to the right of this paragraph.
</p>

<p>
  If you need a full-width figure, give it the <code>fullwidth</code> class. Make sure that’s inside an <code>article</code>, and it will take up (almost) the full width of the screen. This approach is demonstrated below using Edward Tufte’s English translation of the Napoleon’s March data visualization. From <em>Beautiful Evidence</em>, page 122-124.
</p>

<figure class="fullwidth">
  <img src="https://edwardtufte.github.io/tufte-css/img/napoleons-march.png" alt="Figurative map of the successive losses of the French Army in the Russian campaign, 1812-1813" />
</figure>