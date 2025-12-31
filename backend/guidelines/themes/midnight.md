# Midnight Theme

Dark theme optimized for code-heavy presentations. Features auto-scaling for code blocks.

Best for: Tech talks, LT, engineering demos, API documentation

## Available Classes

### cover
```markdown
<!-- _class: cover -->
# Presentation Title
## Subtitle
**Author or Date**
```
Use for: Title page, opening slide

### code-focus
```markdown
<!-- _class: code-focus -->
# Brief Title

\`\`\`typescript
// Your code here
const example = "code";
\`\`\`

Optional description below code.
```
Use for: Showcasing code snippets, API examples
Note: Auto-scaling automatically shrinks large code blocks to fit

### terminal
```markdown
<!-- _class: terminal -->
# command-name

\`\`\`bash
output line 1
output line 2
\`\`\`
```
Use for: CLI demos, installation steps, command output
Note: H1 becomes command with $ prefix (e.g., "# npm install" → "$ npm install")

### split
```markdown
<!-- _class: split -->
# Title

<div class="left">

### Before
\`\`\`python
# old code
\`\`\`

</div>
<div class="right">

### After
\`\`\`python
# new code
\`\`\`

</div>
```
Use for: Code with explanation side-by-side, before/after comparisons
CRITICAL: Empty lines required after opening `<div>` and before closing `</div>`

### highlight
```markdown
<!-- _class: highlight -->
# Key Message

**Important point to emphasize**
```
Use for: Key takeaways, important announcements, section breaks
