---
title: Website Migration to Azure
description: Moved a regulated financial organization's public website off on-prem servers and onto Azure, with automated builds and releases.
date: 2024-01-01
featured: false
tags:
  - Azure
  - Azure DevOps
  - CI/CD
  - SQL
role: core developer
status: live
repo: private (employer work)
---

## Problem

The public website ran on servers the organization managed itself. Releases were done by hand, and there was no consistent path from development to production.

## Approach

```mermaid
flowchart LR
  A[Code repo] --> B[Azure Pipelines<br/>build + release]
  B --> C[Dev]
  C --> D[Staging]
  D --> E[Production]
  C & D & E --- F[(Azure SQL)]
  C & D & E -. secrets .- G[Key Vault]
```

The site moved to Azure App Service with its data in Azure SQL. Azure DevOps Pipelines builds each change and releases it through dev, staging, and production.

## My part

- Worked as a core developer on the team, doing hands-on migration work.
- Helped move the site and its data from on-prem hosting into App Service and Azure SQL.
- Worked on the pipelines that build and release the site.

## Outcome

- **Automated deploys.** Releases run through a pipeline instead of by hand.
- **Separate environments.** Dev, staging, and production are set up the same way, so a change is tested before it goes live.

## Kept private

Specific architecture, network setup, resource names, and security settings stay private. This page describes the shape of the work, not the configuration.
