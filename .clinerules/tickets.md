# Ticketing System

## Overview
This project uses a lightweight, file-based ticketing system inspired by Jira. All tickets are stored as Markdown files in the `tickets/` folder, and epics are stored in the `epics/` folder. This approach keeps all project management artifacts within the repository, providing a single source of truth for both code and tasks.

## Ticket Structure
Each ticket is a Markdown file with the following structure:

```markdown
# Ticket Title

**ID**: TICKET-XXX
**Epic**: EPIC-XXX
**Status**: Open | In Progress | In Review | Done
**Complexity**: 1-5 (1=trivial, 5=very complex)
**Assignee**: @username
**Reporter**: @username
**Created**: YYYY-MM-DD
**Updated**: YYYY-MM-DD

## Description
A clear and concise description of the task, including acceptance criteria.

## Related Tickets
- **Blocks**: TICKET-YYY
- **Is Blocked By**: TICKET-ZZZ
- **Relates To**: TICKET-AAA

## Comments
- **@username (YYYY-MM-DD)**: Comment text...
```

## Epic Structure
Epics are larger bodies of work that group related tickets.

```markdown
# Epic Title

**ID**: EPIC-XXX
**Status**: Open | In Progress | Done
**Reporter**: @username
**Created**: YYYY-MM-DD
**Updated**: YYYY-MM-DD

## Description
A high-level description of the epic, including its goals and success criteria.

## Tickets
- TICKET-XXX: Ticket Title
- TICKET-YYY: Ticket Title
```

## Workflow

### Ticket Creation
1. **Identify Task**: A new task is identified from the implementation roadmap or as a bug/feature request.
2. **Create Epic (if needed)**: If the task is part of a larger body of work, create an epic first.
3. **Create Ticket**: Create a new Markdown file in the `tickets/` folder with a unique ID.
4. **Fill Details**: Add a title, description, epic, complexity, and any related tickets.
5. **Assign**: Assign the ticket to a team member.

### Ticket Lifecycle
1. **Open**: The ticket is created and ready to be worked on.
2. **In Progress**: A developer has started working on the ticket.
3. **In Review**: The work is complete and waiting for code review.
4. **Done**: The code has been merged and the task is complete.

### Tagging and Linking
- **Epics**: All tickets should be linked to an epic.
- **Dependencies**: Use `Blocks` and `Is Blocked By` to manage dependencies.
- **Relationships**: Use `Relates To` for other related tickets.

## Best Practices
- **Atomic Tickets**: Each ticket should represent a single, well-defined task.
- **Clear Acceptance Criteria**: Define what "done" means for each ticket.
- **Regular Updates**: Keep ticket statuses and comments up-to-date.
- **Link Commits**: Reference ticket IDs in commit messages (e.g., `feat: Implement feature [TICKET-123]`).
- **Consistent Naming**: Use the format `TICKET-XXX` for tickets and `EPIC-XXX` for epics.
