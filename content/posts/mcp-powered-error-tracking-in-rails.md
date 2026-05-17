+++
title = 'MCP-Powered Error Tracking in Rails: Triage, Debugging and Profiling from your coding agent'
date = 2026-05-15T12:00:00+04:00
draft = true
+++

{{< toc >}}

## Introduction

About a few months ago I wrote my own error tracking Rails engine. I wanted something very simple and Rails only, something that would be enough for my side projects, and that at the same time would give me power to change it whenever I wanted. And would save me the hassle or the costs of installing trial version of Sentry or other similar tools.

So this post is about my journey writing this tool, what feature it has, and how it evolves to MCP powered error tracking Rails engine. it has the basics of what you would expect from error tracking engine. You can see graphs with historical with the history of exceptions, you can dig into some exception details and see what was the cause, you can see what was the how the stack trace looked at the moment of the exception. The moment the exception was raised, you can mark them as solved, ignored, etc.

 It also has notifier so you can be notified via Slack, Telegram, Discord, or email. It seamlessly integrates with Rails. you don't need to do anything to track errors on Rails application. And it also has helpers in order to capture errors from async jobs.You can see what's going on. It has it's good for debugging. You can see what was the stack trace at the moment or at the moment where the exception was raised. It has GitHub integration, so it's very easy to open issues associated with exceptions.  

Recently I've been including other features on it, so it has a basic APM for inspecting the application performance. You can see the average, the P ninety nine of endpoints, check how many queries were executed against the database, and even flame graphs for the slowest parts of the code base.

And I also wrote MCP server and Claude Code plugin. So when I need to work with this gem, for example, if I want to triage bugs, if I want to debug something specific, like checking the application performance, I can just write to my coding agent and it will get me this information. I don't need to log into the application anymore in order to check these things, and also I don't need to do some copy pasting in order to debug or work on some specific error. Before this feature, I used to go into the application and copy the stack traces and error messages and copy it back to the to the coding agent to s like give it some context on what's was happening to some error, but now I can like it can get everything using the MCP server and cloud code plugin.


I wrote the MCP service and exposed it via HTTP via a token that you can generate and then use when you're configuring the cloud plugin. And it has functions. It has tools to either list things, get more information regarding a specific exception, or to make like destructive actions on the server, like updates, resolving changing statuses, or even creating GitHub issues.

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

That I created the skills that can manipulate the stools and this is a list of them.

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

 The MCP plus plug-in combo allows me to ask questions to the coding agents such as when was the what are the most recent errors? Help me to triage them. Help me to debug a specific error. How's the application performance going recently? Please resolve all bugs related to four or four errors.

The tool for debugging a specific exception is particularly useful because it brings it takes the full exception and stack trace from the server. And since I'm already inside the project directory, it's very easy for the coding agent to relate the stack trace with the current codebase and propose a solution.
