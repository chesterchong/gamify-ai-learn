import 'dotenv/config'
import pkg from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { getDatabaseUrl } from '../src/db/databaseUrl.js'

const { PrismaClient } = pkg

const pool = new pg.Pool({
  connectionString: getDatabaseUrl(),
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Courses
  const course1 = await prisma.course.upsert({
    where: { code: 'BACS1013' },
    update: {},
    create: {
      code: 'BACS1013',
      title: 'Problem Solving & Programming',
      description: 'Master the fundamentals of logic and programming structures.',
      xpReward: 500,
      estimatedHrs: 20,
      difficulty: 'Beginner',
      avgScore: 85,
      aiInsights: 'Master this for FAANG interviews. Data structures are 60% of technical screens.',
      category: 'Computer Science',
      year: 1,
    },
  })

  const course2 = await prisma.course.upsert({
    where: { code: 'BAIT1023' },
    update: {},
    create: {
      code: 'BAIT1023',
      title: 'Web Design & Development',
      description: 'Learn to build modern, responsive websites using React and Tailwind.',
      xpReward: 400,
      estimatedHrs: 24,
      difficulty: 'Beginner',
      avgScore: 92,
      aiInsights: 'Highly relevant for Full-Stack roles. Focus on React and Tailwind components.',
      category: 'Web Development',
      year: 1,
    },
  })

  // Course 3 depends on Course 1
  const course3 = await prisma.course.upsert({
    where: { code: 'BACS2023' },
    update: {
      prerequisiteId: course1.id
    },
    create: {
      code: 'BACS2023',
      title: 'Object Oriented Programming',
      description: 'Deep dive into classes, inheritance, and polymorphism.',
      xpReward: 800,
      estimatedHrs: 30,
      difficulty: 'Intermediate',
      avgScore: 76,
      aiInsights: 'Core software engineering principles. Essential for understanding scalable systems.',
      category: 'Computer Science',
      year: 2,
      prerequisiteId: course1.id
    },
  })

  // Course 4 depends on Course 3
  const course4 = await prisma.course.upsert({
    where: { code: 'BACS2063' },
    update: {
      prerequisiteId: course3.id
    },
    create: {
      code: 'BACS2063',
      title: 'Data Structures & Algorithms',
      description: 'The foundation of efficient problem solving.',
      xpReward: 900,
      estimatedHrs: 40,
      difficulty: 'Hard',
      avgScore: 60,
      aiInsights: 'Build the foundation for efficient problem solving and algorithm design.',
      category: 'Computer Science',
      year: 2,
      prerequisiteId: course3.id
    },
  })

  // --- ROADMAP DATA SEEDING ---
  
  // 1. Problem Solving & Programming (BACS1013)
  const bacs1013Modules = [
    { order: 1, title: 'Logic & Flowcharts', description: 'Mastering the art of visual problem solving.', numLessons: 4, numProblems: 12 },
    { order: 2, title: 'Control Structures', description: 'If-else, switch, and loops in depth.', numLessons: 6, numProblems: 20 },
    { order: 3, title: 'Functions & Modularization', description: 'Breaking down complex problems into smaller tasks.', numLessons: 5, numProblems: 15 },
    { order: 4, title: 'Arrays & Data Handling', description: 'Storing and manipulating collections of data.', numLessons: 8, numProblems: 25 }
  ]

  for (const m of bacs1013Modules) {
    await prisma.module.upsert({
      where: { id: `m-bacs1013-${m.order}` },
      update: { ...m },
      create: { id: `m-bacs1013-${m.order}`, courseId: course1.id, ...m }
    })
  }

  // 2. Web Design & Development (BAIT1023)
  const bait1023Modules = [
    { order: 1, title: 'HTML5 & Semantic Web', description: 'Building the skeleton of the modern web.', numLessons: 5, numProblems: 10 },
    { order: 2, title: 'CSS3 & Responsive Design', description: 'Styling with Flexbox, Grid, and Media Queries.', numLessons: 7, numProblems: 15 },
    { order: 3, title: 'JavaScript Fundamentals', description: 'Adding interactivity to your web pages.', numLessons: 10, numProblems: 30 },
    { order: 4, title: 'React Basics', description: 'Introduction to component-based architecture.', numLessons: 12, numProblems: 20 }
  ]

  for (const m of bait1023Modules) {
    await prisma.module.upsert({
      where: { id: `m-bait1023-${m.order}` },
      update: { ...m },
      create: { id: `m-bait1023-${m.order}`, courseId: course2.id, ...m }
    })
  }

  // Delimiter for quiz in content
  const QUIZ_DELIM = '\n---QUIZ---\n'
  const withQuiz = (content, quiz) => content + QUIZ_DELIM + JSON.stringify(quiz)

  // 2b. Web Design & Development - Lessons and Problems (BAIT1023)
  const bait1023Lessons = [
    // m-bait1023-1: HTML5 & Semantic Web (5 lessons, 10 problems)
    { order: 1, title: 'Introduction to HTML5', type: 'reading', content: withQuiz('HTML5 is the latest version of HTML. It introduces new **semantic elements** like `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, and `<footer>` that make your markup more meaningful and accessible.\n\nSemantic HTML helps search engines and screen readers understand the structure of your page. Use these elements instead of generic `<div>` for better SEO and accessibility.', [{ prompt: 'HTML5 introduces _____ elements for better structure.', answers: ['semantic', 'semantic elements'] }, { prompt: 'The _____ element wraps the main content of a page.', answers: ['main', '<main>'] }]), durationMin: 8 },
    { order: 2, title: 'Document Structure', type: 'reading', content: withQuiz('Every HTML5 document starts with `<!DOCTYPE html>` which tells the browser to render in standards mode. The document is wrapped in an `<html>` element with two main children: `<head>` for metadata (title, links, scripts) and `<body>` for visible content.\n\nAlways use the proper DOCTYPE for HTML5 to ensure consistent rendering across browsers.', [{ prompt: 'Every HTML5 document starts with _____.', answers: ['<!DOCTYPE html>', 'doctype html'] }, { prompt: 'The _____ element contains metadata like title and links.', answers: ['head', '<head>'] }]), durationMin: 10 },
    { order: 3, title: 'Semantic Tags in Practice', type: 'reading', content: withQuiz('Use semantic elements to structure a blog page: `<header>` for the top banner, `<nav>` for navigation links, `<main>` for the main article content, `<article>` for each post, `<aside>` for sidebars, and `<footer>` for the bottom.\n\nThis structure helps search engines and screen readers understand your content. Avoid using `<div>` for everything—semantic tags carry meaning.', [{ prompt: 'The _____ element defines navigation links.', answers: ['nav', '<nav>'] }, { prompt: 'Use _____ for the primary content of the page.', answers: ['main', '<main>'] }]), durationMin: 12 },
    { order: 4, title: 'Forms and Input Types', type: 'reading', content: withQuiz('HTML5 adds new input types: `email`, `url`, `number`, `date`, `range`, `color`, and `tel`. Using the right type gives users better keyboards on mobile and built-in validation.\n\nAlways pair inputs with `<label>` and use the `required` attribute for mandatory fields. The `placeholder` attribute provides a hint.', [{ prompt: 'Use input type _____ for email addresses.', answers: ['email'] }, { prompt: 'The _____ attribute marks a field as required.', answers: ['required'] }]), durationMin: 10 },
    { order: 5, title: 'Accessibility Basics', type: 'reading', content: withQuiz('Use `alt` for images (describe what the image shows), `label` for form inputs (link with `for` and `id`), and ARIA attributes when semantics are not enough. Semantic HTML is the first step toward accessibility.\n\nScreen readers rely on these attributes. Test your site with keyboard-only navigation.', [{ prompt: 'Every image should have an _____ attribute for screen readers.', answers: ['alt'] }, { prompt: 'Use _____ to associate labels with form inputs.', answers: ['label', '<label>'] }]), durationMin: 8 },
    { order: 6, title: 'Build a semantic header', type: 'coding', content: 'Create an HTML5 page with a semantic header containing logo and navigation.', durationMin: 15 },
    { order: 7, title: 'Mark up an article', type: 'coding', content: 'Use article, section, and aside to structure a news article.', durationMin: 15 },
    { order: 8, title: 'Semantic footer', type: 'coding', content: 'Create a footer with copyright and links using semantic elements.', durationMin: 10 },
    { order: 9, title: 'Contact form', type: 'coding', content: 'Build a contact form using HTML5 input types (email, tel, textarea).', durationMin: 15 },
    { order: 10, title: 'Full page layout', type: 'coding', content: 'Combine header, main, aside, and footer into a complete page.', durationMin: 20 },
    { order: 11, title: 'Validate your HTML', type: 'coding', content: 'Ensure your page passes the W3C validator.', durationMin: 10 },
    { order: 12, title: 'Accessible form labels', type: 'coding', content: 'Add proper labels and ARIA attributes to a form.', durationMin: 12 },
    { order: 13, title: 'Responsive meta tag', type: 'coding', content: 'Add the viewport meta tag for responsive design.', durationMin: 5 },
    { order: 14, title: 'Media elements', type: 'coding', content: 'Embed an image and video using HTML5 elements.', durationMin: 15 },
    { order: 15, title: 'HTML5 checklist', type: 'quiz', content: 'Test your knowledge of HTML5 semantic elements.', durationMin: 10 },
    // m-bait1023-2: CSS3 & Responsive Design (7 lessons, 15 problems)
    { order: 1, title: 'CSS Selectors Refresher', type: 'reading', content: withQuiz('Element selectors target tags (e.g., `p`, `div`). Class selectors use `.className`, ID selectors use `#id`. Combinators: descendant (space), child (`>`), sibling (`+`). Pseudo-classes like `:hover`, `:focus`, `:nth-child(n)` add dynamic behavior.', [{ prompt: 'Use a _____ before the class name in a selector.', answers: ['.', 'period', 'dot'] }, { prompt: 'The _____ pseudo-class styles elements on mouse hover.', answers: [':hover', 'hover'] }]), durationMin: 10 },
    { order: 2, title: 'Flexbox Fundamentals', type: 'reading', content: withQuiz('Use `display: flex` on a container to create a flexbox. `flex-direction` (row, column) sets the main axis. `justify-content` aligns along the main axis; `align-items` aligns along the cross axis.\n\nFlexbox is ideal for 1D layouts (rows or columns). Use `gap` for spacing between items.', [{ prompt: 'Set _____ to flex to enable flexbox layout.', answers: ['display', 'display: flex'] }, { prompt: 'Use _____ to align items along the main axis.', answers: ['justify-content', 'justify content'] }]), durationMin: 15 },
    { order: 3, title: 'CSS Grid Basics', type: 'reading', content: 'grid-template-columns, grid-template-rows, gap. Create 2D layouts with Grid.', durationMin: 15 },
    { order: 4, title: 'Media Queries', type: 'reading', content: 'Use @media to apply styles based on screen size. Mobile-first vs desktop-first approaches.', durationMin: 12 },
    { order: 5, title: 'Responsive Units', type: 'reading', content: 'rem, em, vw, vh, and % for flexible layouts. Prefer rem for font sizes.', durationMin: 8 },
    { order: 6, title: 'Flexbox vs Grid', type: 'reading', content: 'When to use Flexbox (1D) vs Grid (2D). Combine both for complex layouts.', durationMin: 10 },
    { order: 7, title: 'Mobile-First CSS', type: 'reading', content: 'Start with mobile styles, then use min-width media queries to scale up.', durationMin: 10 },
    { order: 8, title: 'Flexbox navbar', type: 'coding', content: 'Build a horizontal navbar using Flexbox.', durationMin: 15 },
    { order: 9, title: 'Grid card layout', type: 'coding', content: 'Create a 3-column card layout with CSS Grid.', durationMin: 15 },
    { order: 10, title: 'Responsive breakpoints', type: 'coding', content: 'Add breakpoints at 768px and 1024px for a responsive page.', durationMin: 20 },
    { order: 11, title: 'Center with Flexbox', type: 'coding', content: 'Center content vertically and horizontally using Flexbox.', durationMin: 10 },
    { order: 12, title: 'Sticky footer', type: 'coding', content: 'Use Flexbox or Grid to keep footer at bottom.', durationMin: 12 },
    { order: 13, title: 'Holy Grail layout', type: 'coding', content: 'Build header, sidebar, main, footer layout with Grid.', durationMin: 25 },
    { order: 14, title: 'Responsive images', type: 'coding', content: 'Use srcset and sizes for responsive images.', durationMin: 15 },
    { order: 15, title: 'Dark mode toggle', type: 'coding', content: 'Add prefers-color-scheme media query support.', durationMin: 15 },
    { order: 16, title: 'Flexbox quiz', type: 'quiz', content: 'Test Flexbox properties.', durationMin: 8 },
    { order: 17, title: 'Grid alignment', type: 'coding', content: 'Use align-items and justify-items in a grid.', durationMin: 12 },
    { order: 18, title: 'Mobile menu', type: 'coding', content: 'Create a mobile hamburger menu with media queries.', durationMin: 20 },
    { order: 19, title: 'Responsive typography', type: 'coding', content: 'Use clamp() for fluid typography.', durationMin: 10 },
    { order: 20, title: 'CSS variables', type: 'coding', content: 'Define and use CSS custom properties for theming.', durationMin: 12 },
    { order: 21, title: 'Media queries quiz', type: 'quiz', content: 'Test media query syntax and usage.', durationMin: 8 },
    // m-bait1023-3: JavaScript Fundamentals (10 lessons, 30 problems)
    { order: 1, title: 'Variables and Data Types', type: 'reading', content: withQuiz('Use `let` and `const` (prefer `const` for values that don\'t change). Avoid `var`. Primitive types: string, number, boolean, undefined, null. Objects and arrays are reference types.\n\n`const` prevents reassignment but does not make objects/arrays immutable.', [{ prompt: 'Use _____ for variables that won\'t be reassigned.', answers: ['const'] }, { prompt: 'The primitive types include string, number, and _____.', answers: ['boolean', 'undefined', 'null'] }]), durationMin: 10 },
    { order: 2, title: 'Functions and Scope', type: 'reading', content: 'Function declarations vs expressions. Arrow functions. Lexical scope and closures.', durationMin: 12 },
    { order: 3, title: 'Arrays and Methods', type: 'reading', content: 'map, filter, reduce, forEach. Spread operator. Destructuring.', durationMin: 15 },
    { order: 4, title: 'Objects and JSON', type: 'reading', content: 'Object literals, property access. JSON.stringify and JSON.parse.', durationMin: 10 },
    { order: 5, title: 'DOM Manipulation', type: 'reading', content: 'querySelector, getElementById. Creating and appending elements. Event listeners.', durationMin: 15 },
    { order: 6, title: 'Event Handling', type: 'reading', content: 'addEventListener, event object. Event delegation. preventDefault and stopPropagation.', durationMin: 12 },
    { order: 7, title: 'Async JavaScript', type: 'reading', content: 'Callbacks, Promises, async/await. fetch() for API calls.', durationMin: 15 },
    { order: 8, title: 'Error Handling', type: 'reading', content: 'try/catch/finally. Throwing errors. Handling async errors.', durationMin: 8 },
    { order: 9, title: 'ES6+ Features', type: 'reading', content: 'Template literals, destructuring, optional chaining, nullish coalescing.', durationMin: 10 },
    { order: 10, title: 'Modules', type: 'reading', content: 'import/export. Default vs named exports. Module scope.', durationMin: 10 },
    { order: 11, title: 'FizzBuzz', type: 'coding', content: 'Write FizzBuzz using a loop.', durationMin: 10 },
    { order: 12, title: 'Array sum', type: 'coding', content: 'Sum an array of numbers using reduce.', durationMin: 8 },
    { order: 13, title: 'Filter users', type: 'coding', content: 'Filter array of users by age using filter().', durationMin: 10 },
    { order: 14, title: 'Toggle button', type: 'coding', content: 'Create a button that toggles text on click.', durationMin: 12 },
    { order: 15, title: 'Form validation', type: 'coding', content: 'Validate an email input and show error message.', durationMin: 15 },
    { order: 16, title: 'Fetch and display', type: 'coding', content: 'Fetch data from an API and render a list.', durationMin: 20 },
    { order: 17, title: 'Debounce search', type: 'coding', content: 'Implement debounced search input.', durationMin: 15 },
    { order: 18, title: 'Local storage', type: 'coding', content: 'Save and load user preferences from localStorage.', durationMin: 12 },
    { order: 19, title: 'Tab component', type: 'coding', content: 'Build a simple tab switcher with DOM manipulation.', durationMin: 18 },
    { order: 20, title: 'Countdown timer', type: 'coding', content: 'Create a countdown using setInterval.', durationMin: 15 },
    { order: 21, title: 'JS basics quiz', type: 'quiz', content: 'Variables, types, and functions.', durationMin: 10 },
    { order: 22, title: 'Array methods quiz', type: 'quiz', content: 'map, filter, reduce.', durationMin: 10 },
    { order: 23, title: 'DOM quiz', type: 'quiz', content: 'DOM and events.', durationMin: 10 },
    { order: 24, title: 'Async quiz', type: 'quiz', content: 'Promises and async/await.', durationMin: 10 },
    { order: 25, title: 'More coding problems...', type: 'coding', content: 'Additional practice problems for JavaScript fundamentals.', durationMin: 15 },
    { order: 26, title: 'Spread and rest', type: 'coding', content: 'Use spread and rest operators in a function.', durationMin: 10 },
    { order: 27, title: 'Object destructuring', type: 'coding', content: 'Destructure nested object properties.', durationMin: 10 },
    { order: 28, title: 'Event delegation', type: 'coding', content: 'Handle clicks on a list using event delegation.', durationMin: 12 },
    { order: 29, title: 'Promise chain', type: 'coding', content: 'Chain multiple fetch calls.', durationMin: 15 },
    { order: 30, title: 'Error boundary', type: 'coding', content: 'Wrap async code in try/catch and handle errors.', durationMin: 12 },
    { order: 31, title: 'Sort and filter', type: 'coding', content: 'Sort and filter an array of products.', durationMin: 15 },
    { order: 32, title: 'Dynamic list', type: 'coding', content: 'Add and remove items from a DOM list.', durationMin: 18 },
    { order: 33, title: 'Modal dialog', type: 'coding', content: 'Create open/close modal with JS.', durationMin: 20 },
    { order: 34, title: 'JS final quiz', type: 'quiz', content: 'Comprehensive JavaScript quiz.', durationMin: 15 },
    { order: 35, title: 'Final practice', type: 'coding', content: 'Combined DOM + fetch exercise.', durationMin: 25 },
    { order: 36, title: 'Capstone project', type: 'coding', content: 'Build a small todo app with all concepts.', durationMin: 45 },
    // m-bait1023-4: React Basics (12 lessons, 20 problems)
    { order: 1, title: 'What is React?', type: 'reading', content: withQuiz('React is a library for building user interfaces. It is component-based (UI is composed of reusable components), declarative (you describe what the UI should look like), and uses a virtual DOM for efficient updates.\n\nReact was created by Facebook and is widely used in production.', [{ prompt: 'React uses a _____ DOM for efficient updates.', answers: ['virtual', 'virtual DOM'] }, { prompt: 'React is _____-based—UI is built from components.', answers: ['component', 'component-based'] }]), durationMin: 8 },
    { order: 2, title: 'JSX Syntax', type: 'reading', content: 'JSX mixes HTML-like syntax with JavaScript. Use curly braces for expressions. className instead of class.', durationMin: 10 },
    { order: 3, title: 'Components', type: 'reading', content: 'Function components and props. Composing components. Component reusability.', durationMin: 15 },
    { order: 4, title: 'State with useState', type: 'reading', content: 'useState hook. Updating state. State is immutable.', durationMin: 15 },
    { order: 5, title: 'Rendering Lists', type: 'reading', content: 'Map over arrays to render lists. Use key prop for stable identity.', durationMin: 10 },
    { order: 6, title: 'Event Handlers', type: 'reading', content: 'onClick, onChange, onSubmit. Pass handlers as props.', durationMin: 10 },
    { order: 7, title: 'useEffect', type: 'reading', content: 'Side effects. Dependency array. Cleanup function.', durationMin: 12 },
    { order: 8, title: 'Conditional Rendering', type: 'reading', content: 'Ternary, &&, and early returns for conditional UI.', durationMin: 8 },
    { order: 9, title: 'Forms in React', type: 'reading', content: 'Controlled vs uncontrolled. value and onChange for inputs.', durationMin: 12 },
    { order: 10, title: 'Lifting State Up', type: 'reading', content: 'Share state between components by lifting it to a common parent.', durationMin: 10 },
    { order: 11, title: 'React DevTools', type: 'reading', content: 'Install and use React DevTools to inspect components and state.', durationMin: 5 },
    { order: 12, title: 'Component Patterns', type: 'reading', content: 'Presentational vs container. Composition vs inheritance.', durationMin: 10 },
    { order: 13, title: 'Hello World component', type: 'coding', content: 'Create a simple React component that renders "Hello World".', durationMin: 5 },
    { order: 14, title: 'Props component', type: 'coding', content: 'Create a Greeting component that accepts a name prop.', durationMin: 8 },
    { order: 15, title: 'Counter with useState', type: 'coding', content: 'Build a counter with increment and decrement buttons.', durationMin: 10 },
    { order: 16, title: 'Todo list', type: 'coding', content: 'Build a simple todo list with add and remove.', durationMin: 25 },
    { order: 17, title: 'Form with controlled inputs', type: 'coding', content: 'Create a signup form with controlled inputs.', durationMin: 15 },
    { order: 18, title: 'Fetch data with useEffect', type: 'coding', content: 'Fetch and display data from an API using useEffect.', durationMin: 20 },
    { order: 19, title: 'Parent-child state', type: 'coding', content: 'Lift state to parent and pass down to children.', durationMin: 15 },
    { order: 20, title: 'Filtered list', type: 'coding', content: 'Filter a list based on user input.', durationMin: 15 },
    { order: 21, title: 'Conditional rendering', type: 'coding', content: 'Show loading, error, or data based on state.', durationMin: 12 },
    { order: 22, title: 'React quiz', type: 'quiz', content: 'Test React basics: JSX, props, state.', durationMin: 10 },
    { order: 23, title: 'Hooks quiz', type: 'quiz', content: 'useState and useEffect.', durationMin: 10 },
    { order: 24, title: 'Component composition', type: 'coding', content: 'Compose a Card component from smaller pieces.', durationMin: 15 },
    { order: 25, title: 'useEffect cleanup', type: 'coding', content: 'Add cleanup to useEffect for subscription.', durationMin: 12 },
    { order: 26, title: 'Custom hook', type: 'coding', content: 'Extract logic into a custom useFetch hook.', durationMin: 20 },
    { order: 27, title: 'React final project', type: 'coding', content: 'Build a small app using all React concepts.', durationMin: 45 },
    { order: 28, title: 'React final quiz', type: 'quiz', content: 'Comprehensive React quiz.', durationMin: 15 },
  ]

  const bait1023LessonDefs = [
    { moduleId: 'm-bait1023-1', start: 0, count: 15 },
    { moduleId: 'm-bait1023-2', start: 15, count: 22 },
    { moduleId: 'm-bait1023-3', start: 37, count: 36 },
    { moduleId: 'm-bait1023-4', start: 73, count: 28 },
  ]

  for (const def of bait1023LessonDefs) {
    const slice = bait1023Lessons.slice(def.start, def.start + def.count)
    for (const lesson of slice) {
      await prisma.lesson.upsert({
        where: { id: `l-${def.moduleId}-${lesson.order}` },
        update: { title: lesson.title, type: lesson.type, content: lesson.content, durationMin: lesson.durationMin },
        create: {
          id: `l-${def.moduleId}-${lesson.order}`,
          moduleId: def.moduleId,
          order: lesson.order,
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          durationMin: lesson.durationMin,
        },
      })
    }
  }

  // 2c. Dummy lessons for all chapters in other courses
  const bacs1013Lessons = [
    // m-bacs1013-1: Logic & Flowcharts
    { moduleId: 'm-bacs1013-1', order: 1, title: 'What is a flowchart?', type: 'reading', content: 'A flowchart is a diagram that represents a process using boxes (steps) and arrows (flow). It helps you reason about logic before writing code.', durationMin: 8 },
    { moduleId: 'm-bacs1013-1', order: 2, title: 'Basic flowchart symbols', type: 'reading', content: 'Terminator (start/end), process, decision, input/output, and connectors are common flowchart symbols you will use.', durationMin: 8 },
    { moduleId: 'm-bacs1013-1', order: 3, title: 'Draw your first flowchart', type: 'coding', content: 'Draw a flowchart for checking if a number is even or odd.', durationMin: 12 },
    { moduleId: 'm-bacs1013-1', order: 4, title: 'Flowchart practice set', type: 'coding', content: 'Create flowcharts for login, registration, and password reset flows.', durationMin: 15 },
    // m-bacs1013-2: Control Structures
    { moduleId: 'm-bacs1013-2', order: 1, title: 'If / else logic', type: 'reading', content: 'Branching allows your program to take different paths based on conditions.', durationMin: 8 },
    { moduleId: 'm-bacs1013-2', order: 2, title: 'Loops overview', type: 'reading', content: 'Loops repeat a block of code: while, for, and do-while are the most common.', durationMin: 8 },
    { moduleId: 'm-bacs1013-2', order: 3, title: 'Write a sum loop', type: 'coding', content: 'Write pseudocode that sums numbers from 1 to 10 using a loop.', durationMin: 10 },
    { moduleId: 'm-bacs1013-2', order: 4, title: 'Control structure drills', type: 'coding', content: 'Design pseudocode for menu selection using if/else-if or switch.', durationMin: 12 },
    // m-bacs1013-3: Functions & Modularization
    { moduleId: 'm-bacs1013-3', order: 1, title: 'Why functions?', type: 'reading', content: 'Functions help you break large problems into smaller reusable pieces.', durationMin: 8 },
    { moduleId: 'm-bacs1013-3', order: 2, title: 'Parameters and return values', type: 'reading', content: 'Parameters are inputs to functions, and return values are outputs.', durationMin: 8 },
    { moduleId: 'm-bacs1013-3', order: 3, title: 'Design a helper function', type: 'coding', content: 'Write pseudocode for a function that validates a password.', durationMin: 12 },
    { moduleId: 'm-bacs1013-3', order: 4, title: 'Refactor into functions', type: 'coding', content: 'Take a long pseudocode algorithm and break it into 3–4 functions.', durationMin: 15 },
    // m-bacs1013-4: Arrays & Data Handling
    { moduleId: 'm-bacs1013-4', order: 1, title: 'Array basics', type: 'reading', content: 'An array stores a fixed number of items of the same type under one name.', durationMin: 8 },
    { moduleId: 'm-bacs1013-4', order: 2, title: 'Traversing arrays', type: 'reading', content: 'Use loops to visit each element in an array to read or update values.', durationMin: 8 },
    { moduleId: 'm-bacs1013-4', order: 3, title: 'Find min and max', type: 'coding', content: 'Write pseudocode to find the minimum and maximum value in an array.', durationMin: 12 },
    { moduleId: 'm-bacs1013-4', order: 4, title: 'Array practice set', type: 'coding', content: 'Design algorithms that search for an element and count occurrences.', durationMin: 15 },
  ]

  const bacs2023Lessons = [
    // m-bacs2023-1: Classes & Objects
    { moduleId: 'm-bacs2023-1', order: 1, title: 'From structs to objects', type: 'reading', content: 'Objects bundle data and behavior together, unlike plain structs.', durationMin: 8 },
    { moduleId: 'm-bacs2023-1', order: 2, title: 'Defining a class', type: 'reading', content: 'A class defines the blueprint: fields for state and methods for behavior.', durationMin: 8 },
    { moduleId: 'm-bacs2023-1', order: 3, title: 'Design a Student class', type: 'coding', content: 'Sketch a Student class with name, id, and methods to compute GPA.', durationMin: 12 },
    { moduleId: 'm-bacs2023-1', order: 4, title: 'Object interactions', type: 'coding', content: 'Describe how Student and Course objects could work together.', durationMin: 15 },
    // m-bacs2023-2: Inheritance & Polymorphism
    { moduleId: 'm-bacs2023-2', order: 1, title: 'What is inheritance?', type: 'reading', content: 'Inheritance lets a class reuse and extend another class’s behavior.', durationMin: 8 },
    { moduleId: 'm-bacs2023-2', order: 2, title: 'Polymorphism basics', type: 'reading', content: 'Polymorphism allows one interface to work with many underlying types.', durationMin: 8 },
    { moduleId: 'm-bacs2023-2', order: 3, title: 'Shape hierarchy', type: 'coding', content: 'Design a Shape base class with Circle and Rectangle subclasses.', durationMin: 12 },
    { moduleId: 'm-bacs2023-2', order: 4, title: 'Override a method', type: 'coding', content: 'Describe how draw() would differ between each shape subclass.', durationMin: 12 },
    // m-bacs2023-3: Abstraction & Interfaces
    { moduleId: 'm-bacs2023-3', order: 1, title: 'Abstraction in OOP', type: 'reading', content: 'Abstraction hides complex details and exposes only what users need.', durationMin: 8 },
    { moduleId: 'm-bacs2023-3', order: 2, title: 'Interfaces vs classes', type: 'reading', content: 'Interfaces define contracts without implementation; classes implement them.', durationMin: 8 },
    { moduleId: 'm-bacs2023-3', order: 3, title: 'Design a Repository interface', type: 'coding', content: 'Sketch methods for a generic data repository interface.', durationMin: 12 },
    { moduleId: 'm-bacs2023-3', order: 4, title: 'Plug-in implementations', type: 'coding', content: 'Describe how SQL and in-memory repositories implement the interface.', durationMin: 12 },
    // m-bacs2023-4: Design Patterns
    { moduleId: 'm-bacs2023-4', order: 1, title: 'Why patterns?', type: 'reading', content: 'Design patterns are proven solutions to recurring design problems.', durationMin: 8 },
    { moduleId: 'm-bacs2023-4', order: 2, title: 'Singleton and Factory', type: 'reading', content: 'Singleton controls instance count; Factory centralizes object creation.', durationMin: 8 },
    { moduleId: 'm-bacs2023-4', order: 3, title: 'Implement a Singleton', type: 'coding', content: 'Write pseudocode for a Logger singleton for your application.', durationMin: 12 },
    { moduleId: 'm-bacs2023-4', order: 4, title: 'Factory exercise', type: 'coding', content: 'Design a factory that returns different payment processors.', durationMin: 15 },
  ]

  const bacs2063Lessons = [
    // m-bacs2063-1: Introduction to Complexity
    { moduleId: 'm-bacs2063-1', order: 1, title: 'Why Big O?', type: 'reading', content: 'Big O notation describes how runtime or space grows as input size increases.', durationMin: 8 },
    { moduleId: 'm-bacs2063-1', order: 2, title: 'Common complexities', type: 'reading', content: 'O(1), O(log n), O(n), O(n log n), O(n²) are common complexity classes.', durationMin: 8 },
    { moduleId: 'm-bacs2063-1', order: 3, title: 'Classify algorithms', type: 'coding', content: 'Classify the complexity of a linear search, binary search, and bubble sort.', durationMin: 12 },
    { moduleId: 'm-bacs2063-1', order: 4, title: 'Complexity practice', type: 'coding', content: 'Given code snippets, derive their time complexity.', durationMin: 15 },
    // m-bacs2063-2: Arrays & Strings
    { moduleId: 'm-bacs2063-2', order: 1, title: 'Array vs linked list', type: 'reading', content: 'Arrays provide O(1) access; linked lists provide O(1) insertion at head.', durationMin: 8 },
    { moduleId: 'm-bacs2063-2', order: 2, title: 'Two-pointer technique', type: 'reading', content: 'Two pointers can scan from both ends or move at different speeds.', durationMin: 8 },
    { moduleId: 'm-bacs2063-2', order: 3, title: 'Reverse in-place', type: 'coding', content: 'Write pseudocode to reverse an array in-place using two pointers.', durationMin: 12 },
    { moduleId: 'm-bacs2063-2', order: 4, title: 'Palindrome check', type: 'coding', content: 'Design an algorithm to check if a string is a palindrome.', durationMin: 12 },
    // m-bacs2063-3: Hash Maps & Sets
    { moduleId: 'm-bacs2063-3', order: 1, title: 'Hash map intuition', type: 'reading', content: 'Hash maps store key–value pairs and give average O(1) lookups.', durationMin: 8 },
    { moduleId: 'm-bacs2063-3', order: 2, title: 'Collisions', type: 'reading', content: 'Collisions are resolved via chaining or open addressing strategies.', durationMin: 8 },
    { moduleId: 'm-bacs2063-3', order: 3, title: 'First duplicate', type: 'coding', content: 'Use a set to find the first duplicate value in an array.', durationMin: 12 },
    { moduleId: 'm-bacs2063-3', order: 4, title: 'Frequency map', type: 'coding', content: 'Build a frequency map for characters in a string.', durationMin: 12 },
    // m-bacs2063-4: Linked Lists
    { moduleId: 'm-bacs2063-4', order: 1, title: 'Linked list basics', type: 'reading', content: 'A linked list is a chain of nodes where each node points to the next.', durationMin: 8 },
    { moduleId: 'm-bacs2063-4', order: 2, title: 'Traversal and insertion', type: 'reading', content: 'You traverse a list by following next pointers; insertion requires adjusting links.', durationMin: 8 },
    { moduleId: 'm-bacs2063-4', order: 3, title: 'Insert at head', type: 'coding', content: 'Write pseudocode to insert a new node at the head of a list.', durationMin: 12 },
    { moduleId: 'm-bacs2063-4', order: 4, title: 'Detect a cycle', type: 'coding', content: 'Design Floyd’s Tortoise and Hare algorithm to detect a cycle.', durationMin: 15 },
  ]

  const addLessons = async (lessons) => {
    for (const lesson of lessons) {
      await prisma.lesson.upsert({
        where: { id: `l-${lesson.moduleId}-${lesson.order}` },
        update: {
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          durationMin: lesson.durationMin,
        },
        create: {
          id: `l-${lesson.moduleId}-${lesson.order}`,
          moduleId: lesson.moduleId,
          order: lesson.order,
          title: lesson.title,
          type: lesson.type,
          content: lesson.content,
          durationMin: lesson.durationMin,
        },
      })
    }
  }

  await addLessons(bacs1013Lessons)
  await addLessons(bacs2023Lessons)
  await addLessons(bacs2063Lessons)

  // 3. Object Oriented Programming (BACS2023)
  const bacs2023Modules = [
    { order: 1, title: 'Classes & Objects', description: 'The core pillars of Object-Oriented Programming.', numLessons: 6, numProblems: 12 },
    { order: 2, title: 'Inheritance & Polymorphism', description: 'Reusing code and creating flexible structures.', numLessons: 8, numProblems: 18 },
    { order: 3, title: 'Abstraction & Interfaces', description: 'Defining contracts and hiding implementation details.', numLessons: 5, numProblems: 10 },
    { order: 4, title: 'Design Patterns', description: 'Common solutions to recurring software design problems.', numLessons: 10, numProblems: 15 }
  ]

  for (const m of bacs2023Modules) {
    await prisma.module.upsert({
      where: { id: `m-bacs2023-${m.order}` },
      update: { ...m },
      create: { id: `m-bacs2023-${m.order}`, courseId: course3.id, ...m }
    })
  }

  // 4. Data Structures & Algorithms (BACS2063)
  const bacs2063Modules = [
    { order: 1, title: 'Introduction to Complexity', description: 'Understanding Big O notation and performance analysis.', numLessons: 4, numProblems: 12 },
    { order: 2, title: 'Arrays & Strings', description: 'Learn how to manipulate arrays and strings efficiently.', numLessons: 6, numProblems: 20 },
    { order: 3, title: 'Hash Maps & Sets', description: 'Collision resolution, caching, and fast lookups.', numLessons: 5, numProblems: 15 },
    { order: 4, title: 'Linked Lists', description: 'Singly and doubly linked lists, pointer manipulation.', numLessons: 5, numProblems: 15 }
  ]

  for (const m of bacs2063Modules) {
    await prisma.module.upsert({
      where: { id: `m-bacs2063-${m.order}` },
      update: { ...m },
      create: { id: `m-bacs2063-${m.order}`, courseId: course4.id, ...m }
    })
  }

  // 2. Setup user progress
  const users = await prisma.user.findMany()
  
  if (users.length === 0) {
    console.log('⚠️ No users found. Please create a user first.')
  }

  // First, clean up any old "Getting Started" or "Web Basics" modules that were created by mistake
  await prisma.module.deleteMany({
    where: {
      OR: [
        { title: 'Getting Started' },
        { title: 'Web Basics' },
        { title: 'OOP Concepts' },
        { title: 'Algorithms Basics' }
      ]
    }
  })

  for (const user of users) {
    console.log(`👤 Seeding progress for user: ${user.email} (${user.id})`)
    // Get all modules we just created
    const allModules = await prisma.module.findMany()
    
    for (const m of allModules) {
      let status = 'available'
      let progress = 0
      
      // BACS1013 first module in progress
      if (m.id === 'm-bacs1013-1') {
        status = 'in-progress'
        progress = 65
      }
      
      // RESTORE PREREQUISITE LOGIC:
      // BACS2023 depends on BACS1013 being completed.
      if (m.id.startsWith('m-bacs2023')) {
        status = 'locked'
      }

      // BACS2063 depends on BACS2023 being completed.
      if (m.id.startsWith('m-bacs2063')) {
        status = 'locked'
      }

      await prisma.userModuleProgress.upsert({
        where: { userId_moduleId: { userId: user.id, moduleId: m.id } },
        update: { status, progress },
        create: { userId: user.id, moduleId: m.id, status, progress }
      })
    }
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
