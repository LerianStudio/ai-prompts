# UI Task Flow Example: User Dashboard Card Component

This document demonstrates the complete flow of a UI task through the Lerian Protocol workflows, from backlog to completion.

## Example Task: Create User Dashboard Card Component

**Business Requirement**: Users need a card component to display their profile summary on the dashboard with avatar, name, role, and quick actions.

---

## Phase 1: Backlog to Ready (ui-ready workflow)

### Initial State: Backlog

**File:** `docs/workflows/examples/task-247/description.md` (Example structure)

```markdown
# User Dashboard Card Component

## Description

Create a reusable card component for the user dashboard that displays:

- User avatar
- User name and role
- Status indicator (online/offline)
- Quick action buttons (Edit Profile, Settings)

## Acceptance Criteria

- [ ] Card displays user information clearly
- [ ] Avatar shows user profile image or initials fallback
- [ ] Status indicator shows current online status
- [ ] Quick actions are easily accessible
- [ ] Component follows design system patterns

## Labels

- frontend
- ui
- component
- design-system

## Priority

Medium
```

### Workflow Execution: ui-ready

**Workflow:** `.claude/workflows/ui-ready.yaml` (Conceptual - integrated into Claude Code)

#### Step 1: Frontend Pattern Discovery

**Agent:** `frontend-developer`

```markdown
**Action:** Analyze existing component patterns
**Result:** Identifies shadcn/ui Card, Avatar, and Button components
**Creates:** `frontend-patterns.md`
```

#### Step 2: UI Story Generation

**Agent:** `user-story-generator`

```markdown
**Action:** Generate UI-focused user stories
**Result:** Creates stories emphasizing visual outcomes and interactions
**Creates:** `ui-user-stories`
```

#### Step 3: UI Design Creation

**Agent:** `ui-ux-specialist`
**Action:** Create simple UI specifications
**Result:** Moves task to ready board
**Creates:** Task specifications and implementation todos in Claude Code workspace

#### Step 4: Task Breakdown

**Agent:** `task-breakdown-specialist`
**Action:** Break down into simple implementation tasks
**Result:** Creates unified ui-task structure (not 5 separate types)
**Creates:** Simple `ui-task-1/` folder structure

#### Step 5: Todo Generation

**Agent:** `todo-manager`
**Action:** Generate implementation todos
**Creates:** `todos.md` files

### Resulting File Structure: Ready

```
Claude Code Workspace:
├── TodoWrite active todos for task-247
├── UI specification notes
├── Frontend pattern analysis
└── Implementation todos and progress tracking
```

**UI Specification** (Maintained in Claude Code session context)

```markdown
# User Dashboard Card - UI Specification

## Component Requirements

- Use shadcn/ui Card component as base
- Integrate Avatar component with fallback to initials
- Add Badge component for status indicator
- Include Button components for actions

## Visual Layout
```

┌─────────────────────────────┐
│ [Avatar] Name │
│ Role │
│ [●] Online │
│ [Edit Profile] [Settings] │
└─────────────────────────────┘

```

## Desktop Implementation Focus
- Responsive: min-width 320px, max-width 400px
- Spacing: Use design system tokens
- Colors: Follow existing theme
- Typography: Use established font scales

## Interactions
- Hover states on action buttons
- Click handlers for Edit Profile and Settings
- Status indicator updates based on user state
```

**TodoWrite Implementation List** (Active in Claude Code session)

```markdown
# User Dashboard Card Implementation Todos

## Component Development

- [ ] Create UserDashboardCard component file
- [ ] Import required shadcn/ui components (Card, Avatar, Badge, Button)
- [ ] Implement component props interface (user, onEditProfile, onSettings)
- [ ] Add avatar with fallback to user initials
- [ ] Implement status badge with online/offline states
- [ ] Add action buttons with proper event handlers

## Styling

- [ ] Apply card styling using shadcn/ui Card component
- [ ] Style avatar container and sizing
- [ ] Implement status indicator styling
- [ ] Style action buttons with hover states
- [ ] Ensure responsive behavior on desktop

## Integration

- [ ] Export component from index file
- [ ] Add TypeScript interfaces
- [ ] Test component in Storybook
- [ ] Verify component follows project patterns
```

---

## Phase 2: Ready to Completed (ui-subtask workflow)

### Workflow Execution: ui-subtask

**Workflow:** Integrated Claude Code agent coordination with TodoWrite tracking

#### Step 1: Load and Move to In-Progress

**Agent:** `todo-manager`

```markdown
**Action:** MOVE task from ready to in-progress
**TodoWrite Status:** Move todos from pending to in_progress status
**Result:** TodoWrite initialized with implementation tracking
```

#### Step 2: Implementation

**Agent:** `frontend-developer`
**Action:** Implement all todos following project patterns
**Creates:** Component implementation files

**Implementation Result:**

```typescript
// src/components/UserDashboardCard.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Settings } from "lucide-react"

interface UserDashboardCardProps {
  user: {
    name: string
    role: string
    avatar?: string
    isOnline: boolean
  }
  onEditProfile: () => void
  onSettings: () => void
}

export function UserDashboardCard({ user, onEditProfile, onSettings }: UserDashboardCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.role}</p>
            <div className="flex items-center mt-1">
              <Badge variant={user.isOnline ? "success" : "secondary"} className="text-xs">
                {user.isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEditProfile}>
            <User className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="outline" size="sm" onClick={onSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Step 3: Playwright Validation

**Agent:** `playwright-validator`
**Action:** Use Playwright MCP for screenshot validation

**Playwright Validation Process:**

1. Navigate to component in Storybook
2. Take screenshots of different states
3. Compare against ui-spec.md requirements
4. Verify desktop functionality
5. Test interactive states (hover, click)

**Validation Results:**

```markdown
# Playwright Validation Report

## Screenshots Captured

- ✅ Default state with online user
- ✅ Offline user state
- ✅ Hover states on buttons
- ✅ Long name handling
- ✅ No avatar fallback to initials

## Visual Validation

- ✅ Card layout matches specification
- ✅ Avatar displays correctly
- ✅ Status badge shows appropriate colors
- ✅ Action buttons are properly styled
- ✅ Responsive behavior on desktop sizes

## Interactions Tested

- ✅ Edit Profile button click handler
- ✅ Settings button click handler
- ✅ Hover effects work correctly
```

#### Step 4: Finalize and Move to Completed

**Agent:** `todo-manager`

```markdown
**Action:** MOVE task from in-progress to completed
**TodoWrite Status:** Mark all todos as completed in Claude Code session
**Result:** All todos marked complete, task ready for use
```

### Final File Structure: Completed

```
Implementation Results:
├── src/components/UserDashboardCard.tsx (component implementation)
├── src/components/UserDashboardCard.stories.tsx (Storybook stories) 
├── Playwright validation screenshots
└── TodoWrite session completed with all tasks marked done
```

**TodoWrite Final State** (All todos completed in Claude Code session)

```markdown
# User Dashboard Card Implementation Todos

## Component Development

- [x] Create UserDashboardCard component file
- [x] Import required shadcn/ui components (Card, Avatar, Badge, Button)
- [x] Implement component props interface (user, onEditProfile, onSettings)
- [x] Add avatar with fallback to user initials
- [x] Implement status badge with online/offline states
- [x] Add action buttons with proper event handlers

## Styling

- [x] Apply card styling using shadcn/ui Card component
- [x] Style avatar container and sizing
- [x] Implement status indicator styling
- [x] Style action buttons with hover states
- [x] Ensure responsive behavior on desktop

## Integration

- [x] Export component from index file
- [x] Add TypeScript interfaces
- [x] Test component in Storybook
- [x] Verify component follows project patterns

## Validation

- [x] Playwright screenshots captured and verified
- [x] Desktop functionality confirmed
- [x] Interactive states tested and working

✅ **Task Complete:** UserDashboardCard component implemented and validated
```

---

## Summary: Complete Flow

### Workflow Path

```
Claude Code Session:
    ↓ [Agent coordination with TodoWrite]
Todos: pending → in_progress → completed
    ↓ [Playwright MCP validation]
Implemented Component: UserDashboardCard.tsx ✅
```

### Key Benefits of Simplified Approach

1. **Single UI Task**: No complex breakdown into component/styling/interaction/responsive/accessibility tasks
2. **Desktop Focus**: Validation focused on desktop functionality, not over-engineered responsive testing
3. **Playwright Integration**: Simple screenshot validation using MCP tools
4. **Fast Execution**: Streamlined workflows without excessive validation layers
5. **Clear Structure**: Easy to understand and navigate file organization

### Execution Time Estimate

- **ui-ready workflow**: ~5-8 minutes (vs previous 15-20 minutes)
- **ui-subtask workflow**: ~3-5 minutes (vs previous 10-15 minutes)
- **Total**: ~8-13 minutes for complete backlog-to-completion flow

The component is now ready for integration into the application and follows all project patterns and conventions.
