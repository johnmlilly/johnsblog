---
title: Simple Mortgage Calculator
description: A lightweight mortgage calculator built with React, Vite, and
  Tailwind that emphasizes fast performance and a clean, responsive UI.
image: /assets/projects/mortgage-calculator.png
date: 2025-11-28
featured: true
tags:
  - React
  - Tailwind
  - Vite
link: https://reactmortgagecalculator.netlify.app/
role: solo
status: live
---

## Problem

While we were buying our home, I kept jumping between mortgage calculators to estimate monthly payments. Eventually I wondered why I wasn't just building one.

## Approach

I used Claude to scaffold the app, then asked it to explain the logic instead of pasting code blindly. I had a working React app in under 30 minutes and deployed it to Netlify.

## Lessons

- **Check AI against the docs.** Reading up on `useMemo` led me to the React Compiler, which handles that optimization for you in React 19.
- **Tooling moves fast.** Create React App was deprecated in February 2025, so the project uses Vite instead.
- **AI can be out of date.** Its Tailwind setup used an older config, so I cross-checked it with the current install guide.

I wrote more about it in [What I Learned Building a React App Using AI-Driven Development](/blog/what-i-learned-building-a-react-app-using-ai-driven-development/).
