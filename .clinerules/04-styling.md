# Styling

- Use the shadcn/ui library unless the user specifies otherwise.
- Use builtin Tailwind CSS variable based colors like `bg-primary` or `text-primary-foreground`.
- You MUST generate responsive designs.
- For dark mode, you MUST set the `dark` class on an element. Dark mode will NOT be applied automatically, so use JavaScript to toggle the class if necessary.
- Be sure that text is legible in dark mode by using the Tailwind CSS color classes.
- Always test minimal CSS changes before adding complex styles
- Make small, targeted changes and test their impact before adding more complexity
- Avoid adding unnecessary CSS rules without verifying they're actually needed
- Use browser developer tools to understand existing styles before making changes
- Leverage existing CSS frameworks (like Tailwind) before writing custom CSS
