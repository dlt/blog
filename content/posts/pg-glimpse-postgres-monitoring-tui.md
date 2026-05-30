+++
title = 'Small Iterations Beat Big Prompts: Building pg_glimpse with an AI Agent'
date = 2026-05-30T11:00:00+04:00
draft = false
+++

![pg_glimpse demo](https://dlt.github.io/blog/images/pg-glimpse-demo.gif)

## pg_glimpse

A recent project that I'm proud of is pg_glimpse. It is a TUI Postgres monitoring application. Think of pg_activity, with a slicker UI and a few extra tools. Before I built this tool I was constantly using ad hoc queries to monitor production databases. Now I have something that fits very well in my terminal-based workflow. It started as a proof of concept I built with Claude Code in a couple of afternoons, and later developed into a full monitoring TUI application. It can be used to monitor indexes, tables, replication and vacuum stats, wait events, transaction wraparound, and more. It's also possible to record the statistics collected during a monitoring session and replay them later, so that you can better understand what happened during an incident. During the development of this tool I learned not only more about Postgres internal catalog tables, but also how to steer a coding agent to produce a useful tool while maintaining a high bar for codebase quality. I also learned a bit more about Rust async. I've been doing Rust for less than a year.

## Small iterations beat big prompts

I've built this project with heavy assistance from an AI-agent tool. It was one of the first projects I've built in this way. In my previous AI-assisted projects I was annoyed with the amount of low-quality code and bugs introduced by the coding agents. They required me to review the code and test it with extra care. I also had to constantly redefine prompts and reinforce project rules. So code quality and correctness were priorities for me. I wanted an experienced Rust programmer to look at the code and find no issues with its quality whatsoever. I developed the project in several small iterations. I wanted to have control of the output at the end of each step, rather than write a big prompt/plan and forget about it.

## Under the hood

The architecture is quite simple. An async Tokio event loop triggers at regular intervals and queries the catalog tables for the desired information. This is printed in the form of tables and graphs on the terminal using the ratatui library.

The tests are supported by a Rust crate called "insta". This crate is responsible for snapshot testing. Text representations of the UI are saved in snapshots and the unit tests make assertions based on them.

After the tool settled on its feature set, I wrote unit and integration tests for it. My goal was to guarantee that the tool supported different Postgres versions. Moreover, I knew I needed to go through several refactoring rounds, and the tests would help me avoid regressions. I configured a Rust linter in CI and tackled findings. I also generated a report with a prompt that went more or less like "As a staff Rust engineer, rate this project. What is it doing right and what can be improved?". The LLM output was a .md document that I used to guide my refactoring efforts.

## Shipping

After the refactoring was completed, I packaged it so that it could be installed via Homebrew, Cargo, and Scoop. It was also time to handle some issues, as well as some changes requested by the first users. They mostly revolved around compatibility with different OSes and Postgres cloud services.

The tool's source code and installation instructions can be found in the [GitHub repository](https://github.com/dlt/pg_glimpse).
