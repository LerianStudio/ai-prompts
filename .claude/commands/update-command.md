---
allowed-tools: Write(*), Read(*), LS(*)
description: Update existing slash command instructions with new modifications
argument-hint: [name]
---

# Update Existing Command Instructions

This task guides you through updating an existing command file with new instructions or modifications. The goal is to create an updated version of the command instructions, NOT to execute the selected-command.

## Process

1. Identify command to update:
   - If no command name provided in arguments, ask user which command to update
   - List available commands in `.claude/commands/` directory with frontmatter details:
     - Show command number, filename, title, and description
     - Format as: "1. `filename.md`: Title - Description"
   - Allow selection by name, number, or use $ARGUMENTS if provided
   - Refer to chosen command as "selected-command" throughout process

2. Display current selected-command content:
   - Read the full content of the selected-command
   - Format it nicely for easy review
   - Remind the user that you are ONLY updating instructions, not executing the selected-command

3. Gather update requirements:
   - Ask what specific changes are needed to the selected-command
   - Get details about each requested change

4. Make updates:
   - Update the selected-command file with all requested changes
   - Keep command instructions in English regardless of conversation language
   - Maintain proper markdown formatting and structure
   - Preserve and enhance frontmatter following slash-commands.md standards:
     - Ensure `title`, `description`, `allowed-tools` are properly set
     - Add `argument-hint` if command accepts parameters
     - Include `model` specification if needed

## Important Notes

- Always refer to the command being updated as "selected-command" for consistency
- This session focuses only on updating command instructions - do NOT execute the selected-command
- Preserve proper command file structure and frontmatter standards from slash-commands.md
- Support $ARGUMENTS placeholder usage when enhancing commands
- Consider adding file references (@) and bash execution (!) features where appropriate
- Ensure updated commands follow namespacing and organization best practices
- Never update this file unless it was explicitly selected as the selected-command
