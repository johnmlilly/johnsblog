---
published: false
title: What I Learned Building a React App Using AI-Driven Development
description: A deep dive into building a functional mortgage calculator while
  using Claude AI as a collaborative partner rather than a shortcut to get wrong
  faster.
image: /assets/blog/react-screenshot.webp
imageAlt: React application code screenshot
date: 2025-12-23
featured: true
tags:
  - React
---
My wife and I recently bought a home earlier this year. It was a long journey that started for us all the way back in 2020 before we knew how crazy the housing market would get in the COVID-19 pandemic. We eventually reentered the market this year and were fortunate enough to purchase a property that exceeded our highest expectations.

During the long process of paperwork and planning, I found myself constantly jumping between various mortgage calculators to estimate our monthly payments. Eventually, I hit a point of curiosity: why not just build one myself?

What started as a something for my own personal benefit turned into a valuable project. In less than 30 minutes, I had a functional React application. However, the real value wasn't just the tool itself, but the lessons I learned about React, the current state of AI development, and the importance of intentional learning.

## Bridging the Gap Between AI and Official Documentation

When using Claude AI to scaffold the project, I made a conscious choice: I wouldn't let the AI think for me. Instead of blindly copying and pasting, I asked specific questions about the logic and the underlying [React hooks](https://react.dev/reference/react/hooks). This led me to a deeper exploration of [useMemo](https://react.dev/reference/react/useMemo) for caching results between renders.

Interestingly, my research into the official documentation revealed that with the release of React 19, the new [React Compiler](https://react.dev/learn/react-compiler) automatically handles these optimizations. This results in cleaner code without the need for manual intervention. I only discovered this nuance because I used the AI as a starting point. I asked it questions such as “What is useMemo and how does it work?”, which led me to the official React documentation, and, ultimately, to the discovery that in the newer versions of React it wasn’t strictly necessary for modern applications.

## Navigating the Modern Development Landscape

The development process also highlighted how quickly the frontend landscape shifts. I initially encountered hurdles when I realized that [Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app), which was used for many years to quickly build and deploy React projects, was officially deprecated as of February 2025. After researching better alternatives via Claude, Google, and several [YouTube videos](https://youtu.be/do62-z3z6FM?si=m_EewbFQPMhfdwdz), I pivoted to [Vite](https://vite.dev/). Using Vite allows for significantly faster build times through native ES modules and Rollup, while also providing near-instant hot module replacement, simplified configuration and syntax, and better overall performance and scalability.

Even then, AI isn't perfect. It initially provided an outdated [Tailwind CSS](https://tailwindcss.com/) configuration that relied on older `postcss.config.js` files. By cross-referencing Claude's output with the latest setup guides, I was able to properly configure the environment and deployment. This reinforced a vital lesson: you must understand the work that AI produces. Without that knowing what it’s outputting, you risk building on a foundation of "slop code" that becomes impossible to debug when things eventually break.

## The Value of Breaking Things

One of the greatest advantages of AI is that it allows you to break things faster. While that sounds counterintuitive, it's actually a feature of modern development. When you run code and it fails, you are forced to focus your refactoring efforts to fix real problems rather than assumed features or enhancements. This process moves you from bad code to working code much faster than traditional methods.

Ultimately, your code quality should scale with your understanding of the problem. AI often ignores edge cases and optimizations unless explicitly prompted, which forces you to think about what is missing or what might break. This prevents premature optimization and keeps the focus on building features that provide actual value.

## Don’t Get Too Attached

In the end, the code you write today is simply a stepping stone for the code you will write tomorrow. Requirements change, technologies like React and Claude evolve, and better approaches emerge. By using AI as a tool to get to wrong faster, you can learn the necessary lessons to sharpen your skills, ship better products users actually want, and remain ready to pivot when the next six months of innovation arrive.

You can see my finished project in action here: [https://reactmortgagecalculator.netlify.app/](https://reactmortgagecalculator.netlify.app/)

I enjoy solving complex problems and building efficient tools. If you have a project in mind or need help scaling your next application, [reach out to me here](https://johnlilly.dev/contact/).