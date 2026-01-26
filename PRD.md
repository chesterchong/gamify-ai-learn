# Product Requirements Document (PRD)
## AI-Powered Gamified Learning Platform for Computer Science

**Document Version:** 1.0  
**Last Updated:** 2026-01-26  
**Owner:** FYP Team  
**Project Type:** Final Year Project Prototype (Web-Based, Mobile-Responsive)

---

## Table of Contents
1. Product Overview  
2. Problem Statement  
3. Goals and Success Metrics  
4. Users, Personas, and Stakeholders  
5. Scope (In-Scope / Out-of-Scope)  
6. Assumptions and Constraints  
7. User Journeys and Key Flows  
8. Functional Requirements (Detailed, ID-Based)  
9. Non-Functional Requirements (Engineering Grade)  
10. Data Model (Entities and Fields)  
11. AI/Personalization Logic Specification  
12. System Architecture (Conceptual + Modules)  
13. Analytics and Reporting Requirements  
14. Security and Privacy Requirements  
15. MVP Definition and Release Plan  
16. Risks and Mitigation  
17. Future Enhancements  

---

## 1. Product Overview

### 1.1 Product Name
AI-Powered Gamified Learning Platform for Computer Science

### 1.2 Product Vision
To deliver a Duolingo-inspired learning platform that makes Computer Science fundamentals easier to learn through structured micro-lessons, gamification, and AI-driven personalization.

### 1.3 Product Summary
A web-based platform (mobile-friendly UI) for learning Computer Science topics (e.g., variables, loops, basic algorithms, data structures). The system adapts learning difficulty based on user performance, generates quizzes, and motivates consistent learning through streaks, XP, badges, and levels.

### 1.4 Why This Product Exists
Traditional learning methods often fail to keep learners engaged in abstract CS topics. Existing platforms are either too rigid (typical e-learning) or too advanced/competitive (coding challenge platforms). This platform targets academic learning with structured progression and personalized difficulty adjustment.

---

## 2. Problem Statement

Computer Science education commonly struggles with:
- Low engagement caused by abstract concepts and repetitive learning styles
- Low retention due to lack of consistent revision and motivation
- Lack of adaptive learning in many academic e-learning systems
- Existing coding platforms being too advanced or competition-focused for foundational learning

There is a gap for a gamified + adaptive learning platform tailored specifically for Computer Science education.

---

## 3. Goals and Success Metrics

### 3.1 Product Goals
- Increase student engagement through gamified progression
- Improve learning consistency using streaks and rewards
- Improve mastery and retention via adaptive difficulty and targeted revision
- Provide measurable learning analytics for learners (and optionally educators)

### 3.2 Success Metrics (KPIs)
- **Engagement**
  - Daily Active Users (DAU)
  - Average sessions per week per user
  - Average session duration
- **Learning Outcomes**
  - Accuracy improvement across attempts
  - Module completion rate
  - Mastery score improvement per topic
- **Retention**
  - 7-day and 30-day retention rates
  - Streak continuation rate
- **System Health**
  - Crash/error rate
  - Median API response time

---

## 4. Users, Personas, and Stakeholders

### 4.1 User Roles
| Role | Description |
|---|---|
| Learner | Learns CS content, completes quizzes, earns rewards |
| Admin | Manages content modules, questions, and reviews analytics |
| AI Engine | Adaptive logic component that personalizes learning |

### 4.2 Personas
**Persona A: Beginner CS Student**
- Needs structured progression and immediate feedback
- Easily loses motivation if content is too hard
- Benefits from micro-lessons and reward systems

**Persona B: Self-Learner**
- Wants flexible pacing and revision tools
- Needs targeted practice on weak topics
- Values progress tracking and mastery visibility

### 4.3 Stakeholders
- Students (primary end users)
- Educators / institutions (optional integration)
- Supervisor / examiners (FYP evaluation)
- Development team (FYP team)

---

## 5. Scope

### 5.1 In-Scope (Must Have)
- User registration/login/logout
- Profile-based progression tracking
- Structured modules for CS fundamentals
- Quiz system + adaptive question delivery
- Gamification: XP, levels, streaks, badges
- Immediate feedback for quiz attempts
- Analytics dashboard (at minimum for learner)

### 5.2 Out-of-Scope (Not in Prototype)
- Live instructor sessions
- Peer discussion forum / social network
- Full certification and credentialing
- Competitive ranking/leaderboard (optional future)
- Native mobile app deployment (web-first prototype)

---

## 6. Assumptions and Constraints

### 6.1 Assumptions
- Users have stable internet access
- Users are comfortable with web apps (mobile-friendly)
- Prototype AI can be rule-based initially and later upgraded

### 6.2 Constraints
- FYP timebox and limited development resources
- AI must be feasible within prototype scope
- Content coverage limited to foundational CS topics

---

## 7. User Journeys and Key Flows

### 7.1 Core Journey: New Learner
1. Register account
2. Login
3. Select or start recommended learning path
4. Complete lesson
5. Complete quiz
6. Receive feedback + XP
7. View progress dashboard
8. Continue daily to maintain streak

### 7.2 Journey: Returning Learner
1. Login
2. Resume lesson or take a daily practice quiz
3. AI recommends revision topics
4. Earn streak + rewards

### 7.3 Journey: Admin (Content Management)
1. Login as admin
2. Create modules/lessons
3. Add questions by topic and difficulty
4. Review platform analytics

---

## 8. Functional Requirements (Detailed, ID-Based)

### 8.1 Authentication & Account Management
**FR-AUTH-01:** The system shall allow users to register using email and password.  
**FR-AUTH-02:** The system shall allow users to login/logout securely.  
**FR-AUTH-03:** The system shall support password reset/recovery via email token.  
**FR-AUTH-04:** The system shall store user profile data including XP, level, streak, and mastery.  
**FR-AUTH-05:** The system shall enforce role-based access (Learner, Admin).

### 8.2 Learning Content Management
**FR-CONTENT-01:** The system shall organize learning into Course → Module → Lesson.  
**FR-CONTENT-02:** The system shall allow lessons to be unlocked progressively.  
**FR-CONTENT-03:** Each lesson shall include: explanation, examples, and practice questions.  
**FR-CONTENT-04:** The system shall mark lesson completion status per user.

### 8.3 Quiz & Practice System
**FR-QUIZ-01:** The system shall support question types: MCQ, True/False, short answer, pseudo-code logic.  
**FR-QUIZ-02:** The system shall generate a quiz session per lesson or daily practice.  
**FR-QUIZ-03:** The system shall provide immediate feedback after each question.  
**FR-QUIZ-04:** The system shall record attempts: correctness, time_taken, retries.  
**FR-QUIZ-05:** The system shall show an explanation for correct/incorrect answers.

### 8.4 AI Adaptive Learning (Personalization Engine)
**FR-AI-01:** The system shall compute a mastery score per topic per user.  
**FR-AI-02:** The system shall adjust difficulty based on recent performance trends.  
**FR-AI-03:** The system shall recommend next lessons/topics based on mastery and progress.  
**FR-AI-04:** The system shall increase revision frequency for weak topics.  
**FR-AI-05:** The system shall avoid recommending content above the user’s readiness threshold.

### 8.5 Gamification
**FR-GAME-01:** The system shall award XP for quiz completion and correct answers.  
**FR-GAME-02:** The system shall maintain daily streaks and reset after inactivity threshold.  
**FR-GAME-03:** The system shall implement levels based on XP thresholds.  
**FR-GAME-04:** The system shall award badges for milestones (e.g., 7-day streak, module completion).  
**FR-GAME-05:** The system shall display rewards and achievements in the UI.

### 8.6 Analytics & Progress Dashboard
**FR-ANALYTICS-01:** The system shall provide a learner dashboard showing progress by module and topic.  
**FR-ANALYTICS-02:** The system shall highlight weak areas based on mastery and error rates.  
**FR-ANALYTICS-03:** The system shall show streak history and XP growth.  
**FR-ANALYTICS-04:** The system shall allow admin to view aggregate performance statistics (prototype scope permitting).

### 8.7 Administration (Prototype-Ready)
**FR-ADMIN-01:** Admin shall create/edit/delete modules and lessons.  
**FR-ADMIN-02:** Admin shall create/edit/delete questions by topic and difficulty.  
**FR-ADMIN-03:** Admin shall view basic usage and performance metrics.

---

## 9. Non-Functional Requirements (Engineering Grade)

### 9.1 Performance
- **NFR-PERF-01:** 95% of API calls respond within 2 seconds.
- **NFR-PERF-02:** Quiz feedback should return within 500ms after submission (excluding network).

### 9.2 Scalability
- **NFR-SCALE-01:** Architecture supports adding new modules/topics without refactoring core logic.
- **NFR-SCALE-02:** Services should be stateless where possible.

### 9.3 Security
- **NFR-SEC-01:** Passwords must be hashed using a strong one-way algorithm (e.g., bcrypt/argon2).
- **NFR-SEC-02:** All authenticated endpoints require valid session/JWT token.
- **NFR-SEC-03:** Role-based access control for admin-only functions.

### 9.4 Reliability
- **NFR-REL-01:** User progress must persist correctly after refresh/logout.
- **NFR-REL-02:** System should gracefully handle network errors and retry states.

### 9.5 Usability
- **NFR-UX-01:** Mobile responsive UI for typical phone screens.
- **NFR-UX-02:** Clear visual progress indicators (lesson completion, streak, XP).
- **NFR-UX-03:** Minimize clicks to reach next lesson/quiz (<= 3 interactions).

### 9.6 Maintainability
- **NFR-MAIN-01:** Modular codebase: separate auth, learning, quiz, gamification, AI.
- **NFR-MAIN-02:** APIs versioned (e.g., /api/v1).
- **NFR-MAIN-03:** Logging for key events (login, quiz attempts, level up).

---

## 10. Data Model (Entities and Fields)

### 10.1 User

user_id (uuid)
email
password_hash
role (learner|admin)
xp
level
streak_count
last_active_date
created_at
updated_at


### 10.2 Course / Module / Lesson

course_id
title
description

module_id
course_id
title
order_index

lesson_id
module_id
title
content_markdown
order_index


### 10.3 Topic

topic_id
name
difficulty_level (1..n)


### 10.4 Question

question_id
topic_id
difficulty (1..n)
type (mcq|tf|short|logic)
prompt
choices (optional)
answer_key
explanation


### 10.5 Quiz Session

quiz_id
user_id
mode (lesson|daily|revision)
created_at


### 10.6 Quiz Attempt


attempt_id
quiz_id
question_id
user_id
is_correct
time_taken_ms
retry_count
submitted_at


### 10.7 Mastery

mastery_id
user_id
topic_id
mastery_score (0..100)
last_updated


### 10.8 Rewards

badge_id
name
description
criteria

user_badge_id
user_id
badge_id
earned_at


---

## 11. AI/Personalization Logic Specification

### 11.1 Inputs
- Accuracy over last N questions per topic
- Average time per question
- Consecutive incorrect attempts
- Lesson completion recency
- Streak continuity

### 11.2 Outputs
- Recommend next lesson/module
- Select next quiz difficulty
- Trigger revision quiz
- Repeat lesson recommendation

### 11.3 Prototype Implementation (Recommended)
Start with rule-based thresholds:
- If topic accuracy < 60% over last 10 attempts → reduce difficulty and recommend revision
- If topic accuracy > 85% and avg time within target → increase difficulty or unlock next topic
- If 3 consecutive wrong answers → show hint/explanation and repeat similar question type

Later enhancement:
- Replace thresholds with lightweight ML classifier/regressor if time permits.

---

## 12. System Architecture (Conceptual)

### 12.1 Modules
- Frontend UI (Web)
- API Gateway/Backend
- Auth Service
- Learning Service
- Quiz Service
- Gamification Service
- AI Engine (rules + scoring)
- Database



---

## 13. Analytics and Reporting Requirements

### 13.1 Learner Dashboard (Minimum)
- Progress by module/lesson
- Topic mastery scores
- Recent quiz accuracy trend
- XP/Level display and history
- Streak display and streak calendar

### 13.2 Admin Analytics (Optional in Prototype)
- Total users
- Daily active users
- Most failed topics/questions
- Completion rates by module

---

## 14. Security and Privacy Requirements

### 14.1 Authentication Security
- Strong password hashing (bcrypt/argon2)
- Rate limiting on login attempts
- Secure session/JWT handling

### 14.2 Data Privacy
- Collect only necessary data for learning personalization
- Do not expose user performance publicly without consent
- Admin access separated from learner data views

### 14.3 Basic Threat Considerations
- Prevent unauthorized admin access
- Prevent tampering with XP/levels via server-side validation
- Validate all API inputs

---

## 15. MVP Definition and Release Plan

### 15.1 MVP Must Include
- Login/Register
- At least 2 modules (e.g., Variables/Loops + Basic Algorithms)
- Lesson viewing + quiz flow
- XP + levels + streaks
- Basic AI adaptation (rule-based difficulty)
- Learner dashboard

### 15.2 Release Phases
- Phase 1: Auth + Data Models
- Phase 2: Content + Lesson Delivery
- Phase 3: Quiz System + Attempts Logging
- Phase 4: Gamification Engine
- Phase 5: AI Adaptation + Mastery
- Phase 6: Dashboard + Admin Tools (if time)

---

## 16. Risks and Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| AI too complex | Medium | Start with rule-based logic; upgrade later |
| Scope creep | High | Freeze MVP requirements; backlog everything else |
| Low engagement | Medium | Strengthen rewards feedback and UI clarity |
| Poor question quality | Medium | Curate initial question bank; gradual AI generation |
| Data loss/progress bugs | High | Add automated tests + DB constraints |

---

## 17. Future Enhancements
- AI explanation assistant (tutor-style chat)
- Social features (leaderboards, friend streak comparisons)
- Expanded subjects (Math, Physics, Finance)
- More question types (code execution sandbox)
- Native mobile app (React Native / Flutter)

---