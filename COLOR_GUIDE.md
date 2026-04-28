# 🎨 ChatterBox Color Guide

## Color Palette Reference

### Primary Colors (Indigo/Violet)
Main brand colors for buttons, links, and key UI elements.

```css
primary-50:  #eef2ff  /* Lightest - subtle backgrounds */
primary-100: #e0e7ff  /* Very light backgrounds */
primary-200: #c7d2fe  /* Light backgrounds */
primary-300: #a5b4fc  /* Muted elements */
primary-400: #818cf8  /* Secondary buttons */
primary-500: #6366f1  /* Default primary */
primary-600: #4f46e5  /* Primary buttons, links */
primary-700: #4338ca  /* Hover states */
primary-800: #3730a3  /* Active states */
primary-900: #312e81  /* Darkest - text on light */
```

### Accent Colors (Teal)
Complementary colors for highlights, online status, and special elements.

```css
accent-50:  #f0fdfa  /* Lightest backgrounds */
accent-100: #ccfbf1  /* Very light backgrounds */
accent-200: #99f6e4  /* Light backgrounds */
accent-300: #5eead4  /* Muted elements */
accent-400: #2dd4bf  /* Online status, highlights */
accent-500: #14b8a6  /* Default accent */
accent-600: #0d9488  /* Accent buttons */
accent-700: #0f766e  /* Hover states */
accent-800: #115e59  /* Active states */
accent-900: #134e4a  /* Darkest */
```

### Surface Colors (Slate)
Background and surface colors for depth and hierarchy.

```css
surface-50:  #f8fafc  /* Lightest - text on dark */
surface-100: #f1f5f9  /* Very light text */
surface-200: #e2e8f0  /* Light text */
surface-300: #cbd5e1  /* Muted text */
surface-400: #94a3b8  /* Placeholder text */
surface-500: #64748b  /* Secondary text */
surface-600: #475569  /* Borders */
surface-700: #334155  /* Cards, modals */
surface-800: #1e293b  /* Main backgrounds */
surface-900: #0f172a  /* Darkest backgrounds */
```

---

## Usage Examples

### Buttons

**Primary Button:**
```jsx
<button className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-lg transition-colors shadow-card">
  Click Me
</button>
```

**Secondary Button:**
```jsx
<button className="border border-surface-600 hover:border-primary-400 text-surface-300 px-6 py-3 rounded-lg transition-colors">
  Cancel
</button>
```

**Danger Button:**
```jsx
<button className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg transition-colors">
  Delete
</button>
```

### Cards

**Standard Card:**
```jsx
<div className="bg-surface-800 border border-surface-700 rounded-2xl p-6 shadow-card">
  Card content
</div>
```

**Hover Card:**
```jsx
<div className="bg-surface-800 border border-surface-700 hover:border-primary-600 rounded-2xl p-6 transition-colors cursor-pointer">
  Clickable card
</div>
```

### Inputs

**Text Input:**
```jsx
<input 
  type="text"
  className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
  placeholder="Enter text..."
/>
```

**Textarea:**
```jsx
<textarea 
  className="px-4 py-3 w-full bg-surface-900 border border-surface-600 rounded-lg text-surface-50 placeholder-surface-500 focus:border-primary-500 transition-colors"
  placeholder="Enter message..."
/>
```

### Messages

**Sent Message (User):**
```jsx
<div className="bg-primary-600 text-white p-3 rounded-2xl shadow-md">
  Your message here
</div>
```

**Received Message:**
```jsx
<div className="bg-surface-700 text-surface-50 p-3 rounded-2xl shadow-md">
  Received message here
</div>
```

### Status Indicators

**Online:**
```jsx
<span className="text-accent-400">● Online</span>
```

**Offline:**
```jsx
<span className="text-red-400">● Offline</span>
```

**Typing:**
```jsx
<span className="text-accent-400">Typing...</span>
```

### Backgrounds

**Page Background:**
```jsx
<div className="min-h-screen bg-surface-900">
  Page content
</div>
```

**Modal/Overlay:**
```jsx
<div className="fixed inset-0 bg-black/90 backdrop-blur-sm">
  Modal content
</div>
```

**Glassmorphism:**
```jsx
<div className="bg-surface-800/95 backdrop-blur-sm border border-surface-700">
  Content with glass effect
</div>
```

---

## Color Combinations

### High Contrast (Accessible)
- **Text on Dark:** `text-surface-50` on `bg-surface-900`
- **Text on Light:** `text-surface-900` on `bg-surface-50`
- **Primary on Dark:** `text-primary-400` on `bg-surface-900`

### Medium Contrast
- **Muted Text:** `text-surface-400` on `bg-surface-800`
- **Secondary Text:** `text-surface-300` on `bg-surface-900`

### Borders
- **Subtle:** `border-surface-700`
- **Medium:** `border-surface-600`
- **Accent:** `border-primary-600`

---

## Semantic Colors

### Success
```jsx
<div className="bg-accent-600 text-white">Success message</div>
<span className="text-accent-400">✓ Success</span>
```

### Error
```jsx
<div className="bg-red-600 text-white">Error message</div>
<span className="text-red-400">✗ Error</span>
```

### Warning
```jsx
<div className="bg-orange-600 text-white">Warning message</div>
<span className="text-orange-400">⚠ Warning</span>
```

### Info
```jsx
<div className="bg-primary-600 text-white">Info message</div>
<span className="text-primary-400">ℹ Info</span>
```

---

## Transitions & Animations

### Standard Transition
```jsx
className="transition-colors duration-200"
```

### Hover Effects
```jsx
className="hover:bg-primary-500 hover:scale-105 transition-all"
```

### Focus States
```jsx
className="focus:border-primary-500 focus:ring-2 focus:ring-primary-500/50"
```

---

## Custom Shadows

### Card Shadow
```jsx
className="shadow-card"  /* 0 4px 24px 0 rgba(99,102,241,0.10) */
```

### Glow Effect
```jsx
className="shadow-glow"  /* 0 0 0 3px rgba(99,102,241,0.25) */
```

---

## Best Practices

1. **Consistency:** Always use the defined color palette
2. **Contrast:** Ensure text is readable (WCAG AA minimum)
3. **Hierarchy:** Use color to establish visual hierarchy
4. **Feedback:** Use colors to indicate state (hover, active, disabled)
5. **Accessibility:** Test with color blindness simulators

---

## Quick Reference

| Element | Background | Text | Border |
|---------|-----------|------|--------|
| Page | `surface-900` | `surface-50` | - |
| Card | `surface-800` | `surface-50` | `surface-700` |
| Input | `surface-900` | `surface-50` | `surface-600` |
| Button (Primary) | `primary-600` | `white` | - |
| Button (Secondary) | `transparent` | `surface-300` | `surface-600` |
| Message (Sent) | `primary-600` | `white` | - |
| Message (Received) | `surface-700` | `surface-50` | - |
| Modal | `surface-800` | `surface-50` | `surface-700` |

---

## Tools & Resources

- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Color Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Coolors Palette:** https://coolors.co/
- **Tailwind Color Generator:** https://uicolors.app/create

---

Happy styling! 🎨
