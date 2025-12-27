# Marp Slide Guidelines

## Slide Structure

### Slide Separator
- Use `---` on its own line to separate slides
- Format: `\n---\n` (newline before and after required)

### One Slide One Message
- Each slide must have ONE clear message
- Target: 50-100 words per slide
- Split complex concepts into multiple slides

### Title Rules
- Use specific titles, not generic ones
- BAD: "Results", "Summary", "Method"
- GOOD: "Sales Increased 30%", "3 Key Takeaways"
- Questions work well: "Why Do Projects Fail?"

### Heading Hierarchy
```markdown
# H1 - Slide title (most important)
## H2 - Section heading
### H3 - Subsection
```

## Formatting

### Text Emphasis
- **Bold**: Important keywords only (2-3 per slide max)
- *Italic*: Supplementary info, quotes
- `Code`: Technical terms, specific values

### Lists
- Bullet lists: 3-7 items maximum
- Nesting: 2 levels maximum
- Keep items short (phrases, not sentences)

### Numbered Lists
```markdown
1. First step
2. Second step
3. Third step
```

### Images
```markdown
![Alt text](./images/filename.png)
```

### Code Blocks
````markdown
```python
print("Hello")
```
````

### Tables
```markdown
| Header 1 | Header 2 |
| :------- | -------: |
| Left     | Right    |
```

## Best Practices

### Content Quality
- Remove unnecessary information
- Use concise phrases, not long sentences
- Every element must support the main message

### Visual Hierarchy
- Title: Most prominent, specific and engaging
- Main points: Structured with bullets
- Details: Smaller text or separate slides

### Avoid These
- More than 100 words per slide
- Multiple messages in one slide
- Generic titles ("Results", "Overview")
- Too many emphasis (bold/italic)
- Complex tables or dense data

### Presentation Flow
1. **Opening**: Cover slide with impact
2. **Body**: Section dividers + content slides
3. **Closing**: Summary with clear takeaway

### Theme Class Usage
- Special classes (cover, section, etc.): Max 20-30% of total slides
- Don't use special classes consecutively
- Default (no class) for regular content slides
- Match class to content purpose
