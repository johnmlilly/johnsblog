---
published: true
title: Top 3 JavaScript APIs Every Developer Should Know
tags:
  - JavaScript
description: From data fetching to scroll detection and DOM updates, here are
  the JavaScript APIs that I use most often.
image: /assets/blog/coding-8670014_1280.png
imageAlt: JavaScript API Development
date: 2025-11-17
featured: true
---
This post is for all the tech nerds out there. As I’ve continued growing as a developer, I've naturally found myself diving deeper into JavaScript and all the fun that comes with it. After plenty of tutorials and two online certifications (shoutout to freeCodeCamp for their excellent [JavaScript course](https://www.freecodecamp.org/learn/javascript-v9/)), I finally rolled up my sleeves and began building, experimenting, and improving real applications both at work and on my own time.

Below are three of my favorite native APIs in [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript). This is far from an exhaustive list, but these are the ones I keep coming back to.

## Fetch API

If you’ve spent any time writing JavaScript or using a framework like [React](https://react.dev), this one probably isn’t a surprise. The [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) makes it simple to send and receive data from servers using GET, POST, PUT/PATCH, and DELETE requests.

It’s incredibly helpful for pulling in data from an external API, loading JSON files, or letting users send information back to your application. It can greatly extend the functionality of your site or application, making it more dynamic and responsive for users visiting your site or looking for updated information.

This API has truly transformed how developers make requests in modern web applications. The `fetch` method returns a Promise once the network response becomes available. This Response object will always return a value unless something goes wrong on the server side, making it a predictable and consistent tool for handling asynchronous operations.

Practicing how to use this API and working with it in real-world scenarios will serve you greatly when you move to a popular front-end framework like [React](https://react.dev) or [Vue.js.](https://vuejs.org)

Here’s a quick example of fetching and posting JSON:

```jsx
// GET request
async function getUser() {
  const res = await fetch('<https://jsonplaceholder.typicode.com/users/1>');
  const data = await res.json();
}

// POST request
async function addTodo() {
  const res = await fetch('<https://jsonplaceholder.typicode.com/todos>', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(),
  });

  const data = await res.json();
  console.log(data);
}

getUser();
addTodo();
```

If you want a great beginner-friendly breakdown of this API, check out freeCodeCamp’s article: [https://www.freecodecamp.org/news/javascript-fetch-api-for-beginners/](https://www.freecodecamp.org/news/javascript-fetch-api-for-beginners/)

## Intersection Observer API

As the web has evolved, especially with endless scrolling experiences from platforms like Instagram, LinkedIn, and TikTok, the need to detect when elements appear in the viewport has grown. The [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) solves this beautifully, giving developers an efficient way to respond to elements entering or leaving view.

[MDN](https://developer.mozilla.org/en-US/) describes it well:

> “The Intersection Observer API lets code register a callback function that is executed whenever a particular element enters or exits an intersection with another element (or the viewport).”

The API can be customized with properties like `rootMargin` and `threshold` to fit your needs. For instance, if an animation needs to appear instantly when a user enters the viewport, the `threshold` property can account for that. This is probably my favorite property since it allows for the most fine-grain control over the element you’re observing. You can even pass an array of values into it that will fire each time the element passes one of specified threshold values!

Here’s an example of triggering an animation once an element becomes visible:

```jsx
const section = document.querySelector('.fade-in');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

observer.observe(section);

```

If you want a simple breakdown of how this API works, Web Dev Simplified has a fantastic post on it: [https://blog.webdevsimplified.com/2022-01/intersection-observer/](https://blog.webdevsimplified.com/2022-01/intersection-observer/)

## Mutation Observer API

When you need to keep an eye on changes happening in the DOM, the Mutation Observer API is your friend. It lets you track updates to elements, attributes, and even added or removed nodes, and has three main methods: `disconnect()`, `observe()`, and `takeRecords()`.

In my own experience, I used this API in a search-results feature where the DOM updated after each query. The results container would briefly change classes and disappear during the search, causing issues on mobile with an off-canvas layout. Using a MutationObserver allowed me to detect those changes instantly and ensure the search results were consistently placed for the user to view.

Here’s a simple example of observing attribute changes:

```jsx
const target = document.querySelector('#results');

const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
      console.log('Class changed:', mutation.target.className);
    }
  });
});

observer.observe(target, {
  attributes: true
});
```

If you want an excellent walkthrough of this API, Web Dev Simplified also has a great video on it: [https://www.youtube.com/watch?v=Mi4EF9K87aM](https://www.youtube.com/watch?v=Mi4EF9K87aM)

## Conclusion

These three JavaScript APIs—Fetch, Intersection Observer, and Mutation Observer—have become tools I rely on constantly in day-to-day front-end development. They’re powerful, flexible, and make building interactive experiences much easier.

If you’re working on a project or app and want help implementing any of these APIs, I’d love to help! Send me a message by [filling out my contact form](http://www.johnlilly.dev/contact). Reach out anytime if you’re looking for freelance development work or want to bring an idea to life.