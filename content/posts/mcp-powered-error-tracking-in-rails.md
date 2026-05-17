+++
title = 'MCP-Powered Error Tracking in Rails: Triage, Debugging and Profiling from your coding agent'
date = 2026-05-15T12:00:00+04:00
draft = true
+++

{{< toc >}}

## Introduction

"Are there any recent errors in production?"

"Let's triage the unresolved errors."

"Ignore all Stripe errors."

"Investigate the error #13 and write a test that reproduces it."

These are all prompts my coding agent understands when I work on projects that use Faultline.

About a few months ago I wrote my own error tracking Rails engine. I wanted something simple and Rails only, something that would be enough for my side projects, and that at the same time would give me power to change it whenever I wanted. And would save me the hassle or the costs of installing a trial version of Sentry or other similar tools.

This post is about my journey writing this tool, the motivations behind its set of features, and how it evolved to an MCP-powered error tracking Rails engine. It all started when I felt the need to have better observability around errors and performance issues on a side project I was working on. I wanted something that had more or less the same capabilities of a tool like Sentry, i.e. getting notified whenever an error occurs in production and having enough context in order to investigate the root cause and provide a fix. I also wanted something that was simple and seamlessly integrated on any Rails application. 

It has the basics of what you would expect from an error tracking engine. You can see graphs with the history of exceptions, you can dig into some exception details and see what the cause was, you can see how the stack trace looked and inspect variables at raise point.

<screenshot:raise_point.png>

It also has a notifier so you can be notified via Slack, Telegram, Discord, or email. It seamlessly integrates with Rails. You don't need to do anything to track errors on a Rails application. And it also has helpers in order to capture errors from async jobs. It's also possible to see what the stack trace was at the moment the exception was raised. It has GitHub integration, so it takes one click to open issues for the tracked exceptions.  

It comes with an APM module for inspecting the application performance. It provides average time spent in ms, number of queries executed against the database, and even flame graphs for the slowest parts of the code base.

The gem also includes an MCP server and Claude Code plugin. Now, if I want to triage bugs or check how the application is performing, I can just write to my coding agent instead of logging into the application, avoiding tedious copy pasting and context-switching. Before this feature, I used to go into the application error dashboard and copy the stack traces and error messages into the coding agent.

I wrote the MCP service and exposed it via HTTP, authenticated with a token that you can generate and then use when you're configuring the cloud plugin. It has tools to either list things, get more information regarding a specific exception, or to make destructive actions on the server, like updates, resolving, changing statuses, or even creating GitHub issues.

Here is a list of the available tools and their description:

  Read-only (always available)
  - list_error_groups — recent error groups, filterable by status / search / since
  - get_error_group — full detail for one group by id
  - get_occurrence — full detail for a single occurrence
  - recent_occurrences — recent occurrences for a group
  - error_stats — time-bucketed occurrence counts
  - list_traces — recent APM request traces
  - get_trace — single trace with span breakdown

  Mutating (gated by mcp_readonly = false)
  - resolve_error_group — mark a group resolved (optional note)
  - unresolve_error_group — reopen a resolved group
  - ignore_error_group — set status to ignored
  - delete_error_group — destructive, removes group + occurrences
  - bulk_update_error_groups — apply resolve / unresolve / ignore / delete to many ids in one call
  - create_github_issue — open a GitHub issue from a group (also requires github_configured?)

Then I created the skills that can manipulate the tools, and this is a list of them.

  Browse / investigate
  - recent — list recent unresolved errors
  - spike — recently-active groups ranked by occurrence count
  - stats — time-bucketed occurrence counts
  - debug — deep-dive a specific group with full occurrence detail
  - debugging — broader Rails-production investigation workflow
  - compare — diff occurrences of the same group to see what varies
  - since-deploy — regression check: groups that appeared after a deploy timestamp
  - trace — inspect APM traces (slow endpoints / span breakdown)

  Triage / state changes
  - triage — walk through unresolved groups one at a time
  - resolve — resolve a group (optional note)
  - unresolve — reopen a resolved group
  - ignore — stop a group from surfacing in unresolved lists
  - delete — permanently delete a group + occurrences (destructive)
  - bulk — apply resolve/unresolve/ignore/delete to many ids at once

  Integrations
  - file-issue — open a GitHub issue from a group's most recent occurrence


The tool for debugging a specific exception is particularly useful because it takes the full exception and stack trace from the server. And since I'm already inside the project directory, it's very easy for the coding agent to relate the stack trace with the current codebase and propose a solution.
