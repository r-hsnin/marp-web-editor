# Professional Theme

## Available Classes

### cover
```markdown
<!-- _class: cover -->
# Presentation Title
**Subtitle or Author**
```
Use for: Title page, first impression

### section
```markdown
<!-- _class: section -->
# Section Title
Brief overview (optional)
```
Use for: Chapter dividers, topic transitions

### image-center
```markdown
<!-- _class: image-center -->
# Title (optional)
![Alt](image.png)
**Caption**
```
Use for: Showcasing images, diagrams

### columns
```markdown
<!-- _class: columns -->
# Title

<div class="columns-container">
  <div class="column-item">

Left content

  </div>
  <div class="column-item">

Right content

  </div>
</div>
```
Use for: Comparisons, before/after, pros/cons
CRITICAL: Empty lines required after opening `<div>` and before closing `</div>`

### text-dense
```markdown
<!-- _class: text-dense -->
# Title
Detailed text content...
```
Use for: Reference material, detailed explanations (use sparingly)

### card
```markdown
<!-- _class: card -->
# Title

<div class="card-container">

<div class="card-item">

### Card 1
- Point 1
- Point 2

</div>

<div class="card-item">

### Card 2
- Point 1
- Point 2

</div>

</div>
```
Use for: Multiple items, feature lists (1-3 cards)
CRITICAL: Empty lines required after opening `<div>` and before closing `</div>`
