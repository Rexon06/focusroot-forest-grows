# Focusroot Forest Grows

Build FocusRoot — A Pixel-Art Productivity & Study App 



Create a fully interactive, responsive productivity and study web application called FocusRoot.



The concept is a cozy pixel-art forest game combined with a productivity app. Users improve their real-life focus, grow a virtual forest, organize study notes, and earn rewards for completing work sessions.



This must be an actual working application, NOT a marketing website or static UI mockup.



1. Visual Identity & Design 



Create a beautiful retro 16-bit pixel-art aesthetic inspired by cozy pixel games.



Design direction:



Dark emerald green and forest green color palette. Pixel-art trees, plants, mushrooms, flowers and small forest decorations. Warm cream text and subtle earthy accents. Chunky pixel-style borders and buttons. Pixel fonts such as Press Start 2P for headings and a readable pixel-inspired font for body text. Retro game-style panels, cards, icons and progress bars. Soft animations when trees grow and rewards are earned. Avoid generic SaaS dashboard styling. Avoid excessive gradients, glassmorphism and corporate layouts. 



The interface should feel like a cozy forest adventure.



2. Main Navigation 



Create a persistent navigation bar with these tabs:



Home Focus Notes Garden Settings 



On desktop use a sidebar. On mobile use a bottom navigation bar.



Every navigation item must work.



3. Home Dashboard 



Create a personalized dashboard showing:



Greeting and current date. Daily focus goal. Total focus time today. Number of completed sessions. Current streak. Current forest level. A pixel-art tree representing progress. A quick-start focus button. Recent study activity. Daily intention or motivational message. 



Use real application data rather than hardcoded placeholder numbers.



4. Focus Timer 



Build a fully functional Pomodoro timer.



Features:



25-minute focus session. 45-minute focus session. 60-minute focus session. Custom timer duration. Start, pause, resume and reset. Display remaining time clearly. Completion notification. Automatically record completed sessions. Track total focus time. Reward the user with experience points. 



The timer must continue accurately while navigating between tabs. Do not reset it when switching pages.



5. Notes & Study Cards 



This is one of the most important features.



Create a Notes section where users can:



Upload TXT and Markdown files. Type or paste notes manually. Give notes a title. Organize notes into subjects or folders. Edit and delete notes. Search notes. Save everything persistently. Automatic study card creation 



When a user uploads or pastes notes:



Extract the text. Split the content into logical sections using headings and paragraphs. Create individual study cards. Display cards in a horizontally scrollable collection. Include previous and next navigation. Allow users to expand cards to read the complete content. Show the source note and card number. 



Cards should look like collectible pixel-art items.



Flashcards 



Allow users to turn their notes into question-and-answer flashcards.



Front: Question. Back: Answer. Flip animation. Next and previous controls. Mark as remembered or needs revision. Quizzes 



Create quizzes from the user's notes.



Multiple-choice questions. Four answer options. Correct-answer feedback. Score tracking. Final results screen. 



If AI integration is unavailable, provide a functional manual or rule-based alternative. Never pretend AI generation is working without an actual integration.



6. Virtual Garden 



Create a beautiful pixel-art garden.



The user's focus sessions should help grow the garden.



Features:



Start with a small seed. Complete focus sessions to earn growth points. Seed grows into a plant, then a tree. Unlock different tree types. Add flowers, mushrooms and decorations. Show the forest level. Show total trees grown. Allow users to revisit their garden. 



Make this feature visually rewarding and fun.



7. Distraction Management 



Create a distraction management section.



Allow users to:



Add distracting apps or websites manually. Create a distraction list. Set focus intentions. Display a reminder when starting a focus session. Show a calming interruption screen with a 10-second breathing countdown. 



Important: A browser application cannot detect or block other installed Android applications. Do not fake this functionality. Design the interface so native Android app-blocking can be added in the future.



8. Settings 



Include:



Daily focus goal. Default focus duration. Sound preferences. Notification preferences. Theme preferences. User profile. Reset progress option with confirmation. 9. Data Persistence 



This is essential.



Use local storage or IndexedDB so that:



Notes remain saved after refreshing. Study cards remain available. Timer state is preserved. Focus history is saved. Garden progress is saved. Settings persist. 



Use a clean data structure and reusable components.



10. Technical Requirements Build using React and TypeScript. Use Tailwind CSS where appropriate. Use Lucide icons only where pixel-art equivalents are unavailable. Make the app responsive for desktop and mobile. Keep components modular. Make all buttons and controls functional. Add sensible empty states. Include loading and error states where necessary. Avoid unnecessary paid services. Do not require a paid API key for core functionality. 11. Development Instructions 



Build this in stages:



Stage 1: Create the complete visual design and navigation.



Stage 2: Implement the Home dashboard and functional focus timer.



Stage 3: Implement Notes uploads, editing and automatic study cards.



Stage 4: Implement flashcards and quizzes.



Stage 5: Implement the virtual garden and rewards.



Stage 6: Implement settings, persistent storage and responsive layouts.



Start with Stage 1 and build the application architecture properly. Then continue implementing the features without removing previously working functionality.



At every stage, test the application and fix errors.



Final Goal 



FocusRoot should feel like a cozy pixel-art forest game that secretly helps people become more focused and productive.



The experience should be charming, simple, motivating and genuinely useful.



Prioritize functionality, usability and visual consistency over unnecessary complexity.



Now make the focus timer fully functional and persistent across navigation."

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://focusroot-forest-grows.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6e0227f7-782a-419f-aab1-1aabcd088989).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
