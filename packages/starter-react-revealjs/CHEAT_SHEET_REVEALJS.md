# RevealJS Presenter Cheat Sheet

This document provides a quick reference for common operations when presenting with RevealJS.

## Navigation Controls

### Basic Navigation
- **Next slide**: Right Arrow, Down Arrow, Space, or N key
- **Previous slide**: Left Arrow, Up Arrow, or P key
- **First slide**: Home key
- **Last slide**: End key
- **Specific slide**: Type the slide number followed by Enter

### Vertical Navigation
- **Next vertical slide**: Down Arrow or Space
- **Previous vertical slide**: Up Arrow

## Overview Mode
- **Enter overview mode**: Press ESC or O key
- **Navigate in overview**: Arrow keys
- **Select slide in overview**: Click on slide or press Enter
- **Exit overview**: Press ESC again

## Speaker View
- **Open speaker view**: Press S key
- **Speaker view features**:
  - Current and upcoming slides
  - Speaker notes
  - Timer
  - Clock

## Zoom
- **Zoom in**: Press Alt + Click (or Ctrl + Click on some systems)
- **Pan while zoomed**: Click and drag
- **Reset zoom**: Press ESC

## Fullscreen
- **Enter fullscreen**: Press F key
- **Exit fullscreen**: Press ESC or F key again

## Other Controls
- **Pause/resume presentation**: Press B or . (period) to black out the screen
- **Show help**: Press ? or H
- **Print mode**: Add ?print-pdf to the URL and use browser's print function
- **Toggle speaker notes**: Press S

## Touch Controls
- **Next slide**: Swipe left
- **Previous slide**: Swipe right
- **Navigate up**: Swipe up
- **Navigate down**: Swipe down

## URL Parameters
- **Start at specific slide**: Add `#/2/3` to URL (slide 2, vertical slide 3)
- **Auto-slide mode**: Add `?autoSlide=5000` (5 second intervals)
- **Loop presentation**: Add `?loop=true`
- **Show speaker notes**: Add `?showNotes=true`

## Keyboard Shortcuts Reference

| Key | Function |
|-----|----------|
| N, SPACE | Next slide |
| P | Previous slide |
| ↑, ↓, ←, → | Navigation |
| Home | First slide |
| End | Last slide |
| B, . | Pause (black screen) |
| F | Fullscreen |
| ESC, O | Overview mode |
| S | Speaker notes view |
| ? | Show help |
| Alt + click | Zoom in |
| ESC | Zoom out |

## Tips for Presenters

1. **Prepare speaker notes**: Add notes to your slides using the `<aside class="notes">` element
2. **Practice with speaker view**: Get comfortable with the speaker view before your presentation
3. **Use keyboard shortcuts**: Memorize the most common shortcuts for smooth navigation
4. **Check your presentation**: Test on the actual device you'll be presenting from
5. **Have a backup**: Save a PDF version of your slides as backup
6. **Time your presentation**: Use the timer in speaker view to stay on schedule
7. **Disable screen timeout**: Make sure your device won't go to sleep during the presentation

## RevealJS-specific Features

### Fragments
- Elements with class `fragment` will be animated
- Navigate through fragments with the same controls as slides

### Auto-Animate
- Add `data-auto-animate` to both slides to enable automatic animations between them

### Backgrounds
- Add `data-background="#ff0000"` to a slide for colored background
- Use `data-background-image="image.jpg"` for image backgrounds
- Video backgrounds: `data-background-video="video.mp4"`

### Transitions
- Add `data-transition="zoom"` to a slide
- Available transitions: none, fade, slide, convex, concave, zoom

## Troubleshooting

- **Slides not advancing**: Check if you're in overview mode (press ESC to exit)
- **Speaker notes not showing**: Make sure you pressed S and have notes in your slides
- **Presentation looks different**: Check if you're in print mode or have unexpected URL parameters
- **Videos not playing**: Check browser autoplay policies and file formats
