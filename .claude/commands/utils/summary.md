---
allowed-tools: Read(*), Grep(*), LS(*)
description: Summarize everything discussed in current chat conversation with structured TLDR and bullet points
argument-hint: []
---

# /summary

Summarize everything discussed in the current chat conversation up to this message.

## Usage

```bash
/summary
```

**Arguments:**

- None required - analyzes the entire current conversation

## Instructions

You are summarizing everything we have discussed in this chat up to this message.

**Deliverable – exact structure**

## TLDR

• 2-3 sentence high-level recap (≤50 words).

## Bullet Points

• Key decisions\
• Action items with responsible parties\
• Open questions / blockers\
• Next steps\
(Limit to 8 bullets total.)

## Code Snippets

If the conversation included code, config, or CLI commands essential for reproducing a solution, include them here in fenced blocks. Omit boilerplate.

**Rules**

- Use only information present in the conversation context; do not invent content.
- Preserve original terminology, variable names, and paths.
- Write in crisp business English; avoid filler.
- Entire summary (excluding code blocks) ≤300 words.
