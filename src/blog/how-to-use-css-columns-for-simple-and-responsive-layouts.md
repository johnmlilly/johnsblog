---
published: true
title: How to Use CSS Columns for Simple & Responsive Layouts
description: While Grid and Flexbox are powerful, sometimes the simplest
  solution is the most effective.
image: /assets/css-columns.png
imageAlt: CSS Columns
date: 2026-03-02
featured: true
tags:
  - CSS
---
Often as a developer, I reach for `flexbox` or `grid` to quickly create a two-column layout. This is one of the most common layout patterns when building pages, whether for a new marketing initiative, a reusable template, or even rendering a list inside a blog post.

However, modern CSS has evolved to the point where there’s an even simpler way to handle multi-column layouts without using either of those widely popular display properties: `columns`.

For content-driven sections especially, this approach can dramatically reduce the amount of CSS required.

\## What is the Columns Property?

The \[\`columns\`\]([https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/columns](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/columns)) shorthand property accepts two values:

\- A **column width**

\- A **column count**

Here’s what that looks like in the wild:

\`\`\`css

.container {

columns: 200px 3;

gap: 1.5rem;

}

\`\`\`

In this example:

\- Each column will aim to be at least `200px` wide.

\- The browser will create up to `3` columns if space allows.

\- The `gap` property evenly spaces the columns, just like with flexbox and grid.

As the parent container shrinks, the columns automatically adjust. When there’s no longer enough room to fit multiple columns at the defined width, they stack naturally with no media queries required! Isn’t that awesome? I love when you can let the browser handle the responsiveness.

\## A Real-World Example

Let’s say you’re rendering a simple list of features inside a marketing page or blog post.

\### HTML

\`\`\`html

## Platform Features

*   Fast load times
*   Accessible components
*   SEO-friendly markup
*   Responsive by default
*   Modern CSS techniques
*   Clean semantic structure
*   Reusable design patterns
*   Performance optimized
*   Cross-browser support

\`\`\`

\### CSS

\`\`\`css

.feature-list {

columns: 200px 3;

gap: 1.5rem;

padding-left: 1.25rem; /\* preserve default list indentation \*/

}

.feature-list li {

margin-bottom: 0.5rem;

}

\`\`\`

On wider screens, you’ll see up to three columns. As the viewport narrows, the layout reduces to two columns and then to one on mobile screens.

\## When to Use CSS Columns

This method works best when:

\- Content should flow naturally from top to bottom

\- Strict row alignment isn’t required

\- You’re working with text-heavy sections or lists

Because content flows vertically first and then horizontally, this isn’t a replacement for grid in complex layout systems. But for simple multi-column content blocks, this is a great, quick solution that’s easy to implement.

Browser support for CSS Columns is above 90%, making it widely available in all modern browsers. For most projects, this makes it a safe and practical option.

Flexbox and Grid are still incredibly powerful and necessary tools, but sometimes the simplest solution is also the most effective. For responsive multi-column content, `columns` is a feature worth reaching for more often. This approach can dramatically reduce the amount of CSS required.