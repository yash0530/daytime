# Design System

Comprehensive guide to the Daytime visual design system.

---

## Color Palette

### Core Colors

| Token | Value | Preview | Usage |
|-------|-------|---------|-------|
| `--bg-primary` | `#0f0f1a` | ![#0f0f1a](https://via.placeholder.com/20/0f0f1a/0f0f1a) | Page background |
| `--bg-secondary` | `#1a1a2e` | ![#1a1a2e](https://via.placeholder.com/20/1a1a2e/1a1a2e) | Secondary sections |
| `--bg-card` | `rgba(255,255,255,0.05)` | — | Card backgrounds |
| `--bg-card-hover` | `rgba(255,255,255,0.08)` | — | Card hover state |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#ffffff` | Headings, primary text |
| `--text-secondary` | `rgba(255,255,255,0.7)` | Body text |
| `--text-muted` | `rgba(255,255,255,0.5)` | Hints, labels |

### Accent Colors

| Token | Value | Preview | Usage |
|-------|-------|---------|-------|
| `--accent-purple` | `#667eea` | ![#667eea](https://via.placeholder.com/20/667eea/667eea) | Primary accent, links |
| `--accent-pink` | `#f093fb` | ![#f093fb](https://via.placeholder.com/20/f093fb/f093fb) | Secondary accent |
| `--accent-cyan` | `#00d4ff` | ![#00d4ff](https://via.placeholder.com/20/00d4ff/00d4ff) | Highlights, badges |
| `--accent-green` | `#38ef7d` | ![#38ef7d](https://via.placeholder.com/20/38ef7d/38ef7d) | Success states |
| `--error-color` | `#f5576c` | ![#f5576c](https://via.placeholder.com/20/f5576c/f5576c) | Errors, destructive |

### Gradients

```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--accent-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--dark-gradient: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
--success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
```

---

## Typography

### Font Family
```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
```

Import via Google Fonts:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

### Font Weights

| Weight | Class/Usage | Example |
|--------|-------------|---------|
| 400 | Regular body text | Descriptions, paragraphs |
| 500 | Medium emphasis | Labels, captions |
| 600 | Semi-bold headers | Card titles, section headers |
| 700 | Bold headers | Page titles, important numbers |

### Size Scale

| Size | Usage |
|------|-------|
| 56px | Timer display |
| 28px | Page titles, h1 |
| 20px | Dialog titles |
| 18px | Section headers, h3 |
| 16px | Large body text |
| 15px | Default body, inputs |
| 14px | Small body, buttons |
| 13px | Labels, badges |
| 12px | Muted text, dates |
| 9-11px | Micro text |

---

## Spacing & Layout

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| Small | 8px | Inner elements, pills |
| Medium | 12px | Buttons, inputs |
| Large | 16px | Cards, sections |
| XL | 20px | Auth cards, main panels |
| Round | 50px | Pill buttons |

### Shadows

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 20px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.5);
--shadow-glow: 0 0 30px rgba(102, 126, 234, 0.3);
```

### Border

```css
--border-color: rgba(255, 255, 255, 0.1);
--border-glow: rgba(102, 126, 234, 0.5);
```

---

## Transitions

```css
--transition-fast: 0.15s ease;
--transition-medium: 0.3s ease;
--transition-slow: 0.5s ease;
```

---

## Animations

### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Slide Up
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Timer Pulse
```css
@keyframes timerPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(56, 239, 125, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(56, 239, 125, 0);
  }
}
```

---

## Component Patterns

### Cards
```css
.card {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
}
```

### Section Cards (Templates, Goals)
Section cards contain nested item cards with a consistent hover pattern:
```css
/* Container section */
.section {
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 24px;
}

/* Nested items - transparent by default, subtle highlight on hover */
.section-item {
  background: transparent;
  border: none;
  border-radius: 16px;
  padding: 20px;
  transition: all var(--transition-fast);
}

.section-item:hover {
  background: var(--bg-card-hover);
}
```

### Buttons

**Primary Button:**
```css
.btn-primary {
  padding: 14px 24px;
  background: var(--primary-gradient);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}
```

**Secondary Button:**
```css
.btn-secondary {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}

.btn-secondary:hover {
  border-color: var(--accent-purple);
}
```

**Destructive Button:**
```css
.btn-destructive {
  background: rgba(245, 87, 108, 0.1);
  color: var(--error-color);
  border: 1px solid rgba(245, 87, 108, 0.3);
}
```

### Inputs
```css
input {
  width: 100%;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

input:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}
```

### Tags/Badges
```css
.tag {
  font-size: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(102, 126, 234, 0.15);
}

.badge-duration {
  color: var(--accent-cyan);
  background: rgba(0, 212, 255, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}
```

---

## Glassmorphism

Core technique for card backgrounds:

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## Responsive Breakpoints

| Breakpoint | Usage |
|------------|-------|
| `768px` | Tablet layouts |
| `600px` | Mobile adjustments |
| `480px` | Small mobile |

Example:
```css
@media (max-width: 768px) {
  .dashboard { padding: 16px; }
  .dashboard-header { flex-direction: column; }
}
```

---

## Dark Theme Considerations

- All backgrounds are dark by default
- Text uses light colors with varying opacity
- Form inputs use `color-scheme: dark` for native elements
- Chart tooltips styled with dark backgrounds

---

## Accessibility

- Sufficient color contrast (WCAG AA)
- Focus visible states on interactive elements
- Semantic HTML structure
- Keyboard navigation support
