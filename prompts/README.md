# Cursor.ai Build Prompts

This directory contains structured prompt files for Cursor.ai development sessions. Each prompt file follows a consistent template to ensure clear communication and organized development.

## 📁 File Structure

```
prompts/
├── README.md                           # This file
├── prompt-001-home-ribbon-layout.md    # Home ribbon layout implementation
├── prompt-002-task-properties-drawer.md # Task properties drawer
├── prompt-003-task-linking.md          # Task linking functionality
└── ...                                 # Additional prompts
```

## 📋 Prompt File Template

Each prompt file follows this structure:

```markdown
### 🧠 Prompt XXX – [Feature Name]

**Component(s):** [List of components involved]

**Goal:** [Clear description of what needs to be accomplished]

**Instructions:**

- [Step-by-step instructions]
- [Specific requirements]
- [Technical details]

**Files to Modify:**

- [List of files that will be changed]

**Expected Outcome:**

- [What should be achieved]
- [Success criteria]

**Status:** [Planned/In Progress/Completed]
**Priority:** [High/Medium/Low]
**Estimated Effort:** [High/Medium/Low]
```

## 🚀 Usage

1. **Create a new prompt:** Copy the template and fill in the details
2. **Update status:** Mark prompts as "In Progress" when starting work
3. **Track completion:** Update to "Completed" when finished
4. **Reference in commits:** Include prompt number in commit messages

## 📊 Status Tracking

- **Planned:** Ready to be implemented
- **In Progress:** Currently being worked on
- **Completed:** Successfully implemented
- **Blocked:** Waiting for dependencies
- **Cancelled:** No longer needed

## 🔗 Integration

These prompts integrate with:

- `src/utils/buildQueue.js` - Development progress tracking
- `ROADMAP.md` - Project roadmap
- `CHANGELOG.md` - Change documentation

## 📝 Naming Convention

- Format: `prompt-XXX-[feature-name].md`
- Use kebab-case for feature names
- Include leading zeros for prompt numbers (001, 002, etc.)
