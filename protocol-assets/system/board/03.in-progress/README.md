# 03. In-Progress

## Purpose

The In-Progress stage tracks tasks that are actively being worked on by team members. This provides visibility into current development efforts and helps identify potential blockers or bottlenecks.

## Entry Criteria

Items enter In-Progress when:

- Developer assigns themselves to the task
- Work actively begins
- Feature branch is created
- Initial commits are made
- Task status is updated in tracking system

## Exit Criteria

Items move from In-Progress to Testing when:

- Implementation is complete
- Code passes local tests
- Pull request is created
- Code review is requested
- Documentation is updated

## Work In Progress (WIP) Limits

- Maximum 2-3 tasks per developer
- Focus on completion over starting new work
- Communicate blockers immediately
- Update progress daily

## Daily Practices

- Update task status in morning standup
- Commit code changes regularly
- Keep pull requests small and focused
- Request help when blocked
- Document decisions and changes

## Task Management

```
03.in-progress/
├── task-010-[developer-name]-feature.md
├── task-011-[developer-name]-bugfix.md
└── blocked/
    └── task-012-waiting-for-api.md
```

## Progress Tracking

Each in-progress task should include:

- Current status and percentage complete
- Latest commit references
- Blockers or dependencies
- Expected completion date
- Notes on approach or changes
