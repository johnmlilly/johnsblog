---
published: true
title: How to Render HTML Safely and Prevent XSS
description: Learn three safer alternatives to render HTML that help prevent XSS
  attacks, including the new Sanitizer API, DOMPurify, and manual DOM rendering.
image: /assets/10221304.jpg
imageAlt: A user browsing the web securely
date: 2026-03-16
featured: true
tags:
  - Security
---
If you’ve written JavaScript for any length of time, you’ve probably used `innerHTML`. It’s quick, convenient, and everywhere in video and blog tutorials. Sadly, it’s also one of the easiest ways to introduce a [**Cross-Site Scripting (XSS)**](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS) vulnerability into your site or application.

It’s incredibly convenient: drop in a string of HTML and the browser renders it instantly. The problem is that it renders _everything_, including malicious scripts. If user input or external data ends up in `innerHTML`, an attacker can inject something like `<img src=x onerror=alert(1)>`, and the browser will execute it.

Fortunately, there are better patterns available to developers today.

## 1\. The Emerging Standard: `setHTML()` and the Sanitizer API

A newer browser API aims to solve this exact problem: the [**Sanitizer API**](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API). Instead of rendering a string like `innerHTML`, the method sanitizes the markup before inserting it into the DOM.

The key method is `setHTML()`, which parses the HTML and removes dangerous elements such as `<script>` tags and unsafe attributes.

Example:

```jsx
const dirtyInput = '<img src=x onerror=alert(1)> <b>Hello</b>';
const element = document.getElementById("target");

element.setHTML(dirtyInput);
```

In this case, the unsafe `onerror` attribute is stripped before the content is rendered.

The big advantage is that sanitization happens **natively in the browser**, meaning you don’t have to rely on external libraries for basic protection.

The downside is that support is still limited since the API is relatively new. It’s part of an effort by [web standards bodies](https://webstatus.dev/?q=sanitizer+api) to make safe DOM rendering easier by default.

As browser support improves, this will become the **go-to replacement** for `innerHTML`.

## 2\. The Current Industry Standard: DOMPurify

Until the Sanitizer API becomes widely supported, most developers rely on a battle-tested sanitization library. One of the more popular options is [**DOMPurify**](https://github.com/cure53/DOMPurify)**, which** takes a string of HTML, removes dangerous content, and returns a safe version you can insert into the DOM.

Example:

```jsx
import DOMPurify from "dompurify";

const dirtyInput = '<img src=x onerror=alert(1)> <b>Hello</b>';
const cleanHTML = DOMPurify.sanitize(dirtyInput);

document.getElementById("target").innerHTML = cleanHTML;
```

This approach keeps the convenience of string-based rendering while preventing common XSS vectors.

DOMPurify is widely used, actively maintained, and recommended by many security professionals. It works across modern browsers and integrates easily with popular frameworks like React or Vue, as well as good old vanilla JavaScript.

If you need to render user-generated HTML (for example comments, CMS content, or rich text), using a sanitizer like this is considered a best practice.

## 3\. The Old-School Standard: Create Elements Manually

Sometimes the safest approach is also the simplest: avoid rendering raw HTML entirely.

Instead of passing a string to the DOM, build the structure using native [DOM APIs](https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API) like `createElement()` and `textContent`. This ensures that user input is treated as plain text rather than executable markup.

Example:

```jsx
const container = document.getElementById("target");

const message = document.createElement("p");
message.textContent = "Hello world";

container.appendChild(message);
```

Because `textContent` escapes everything automatically, even something like `<script>alert(1)</script>` would simply appear as text rather than executing.

This approach is ideal when you control the structure of the UI and don’t actually need arbitrary HTML rendering. Many modern frameworks effectively follow this model under the hood by constructing DOM nodes instead of injecting raw strings.

The trade-off is that it’s more verbose than `innerHTML`, especially when building complex layouts. But from a security perspective, it’s extremely reliable because there’s no HTML parsing involved.

## Final Thoughts

Using `innerHTML` without thinking about the source of the content can create serious security risks. As applications rely more on user-generated data and third-party APIs, it’s worth adopting safer patterns.

A good rule of thumb:

*   Use **manual DOM creation** when you control the structure.
    
*   Use **DOMPurify** when you need to safely render HTML today.
    
*   Keep an eye on the **Sanitizer API and** `setHTML()`, which may become the standard approach once browser support catches up.
    

Security best practices evolve quickly on the web. Staying aware of these alternatives helps ensure that convenience doesn’t come at the cost of a serious vulnerability. The need to stay vigilant and up to date on the latest trends and technologies is more important than ever in today’s landscape.