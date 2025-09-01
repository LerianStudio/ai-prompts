---
allowed-tools: Read(*), Grep(*), LS(*), Write(*), memory_create(*)
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

After generating the summary, save it using memory tools as the primary method:

1. **Primary: Use memory_create tool** to store the summary with these parameters:
   - First, determine the repository name from the current working directory
   - Use that directory path as the repository identifier
   ```json
   {
     "operation": "store_chunk",
     "options": {
       "repository": "[current-working-directory]",
       "session_id": "conversation-summary",
       "content": "# [Summary Title]\n\n[Full summary content including TLDR, bullet points, and code snippets]"
     }
   }
   ```

2. **Fallback: Save to file system** only if memory tools are unavailable:
   `@protocol-assets/content/docs/summary/[descriptive-name].md`

Choose a clear, descriptive title based on the main topic discussed.

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
