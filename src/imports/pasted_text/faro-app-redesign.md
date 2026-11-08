# FARO — Mobile Flutter Application Redesign

## IMPORTANT INSTRUCTION

Modify the **EXISTING prototype**.

Do NOT create an unrelated application from scratch.

Preserve the existing application's core functionality, thesis purpose, features, sample data, and overall visual quality, but completely adapt the interface from a responsive web application into a **mobile application**.

The application's name has changed from **WISE** to **FARO**.

---

# 1. APPLICATION IDENTITY

## New Application Name

**FARO**

## Full Name

**Fatigue Assessment and Recommendation Optimizer**

## Purpose

FARO is a mobile application designed specifically for **working students of the University of Northern Philippines**.

The system:

- Monitors student productivity and daily activities
- Assesses and predicts fatigue levels
- Identifies factors contributing to fatigue
- Provides personalized recommendations
- Helps working students balance academic responsibilities and employment
- Supports healthier productivity habits
- Provides useful insights based on recorded student data

This is NOT a generic productivity application.

It is specifically designed as a:

**Fatigue Assessment + Productivity Monitoring + Recommendation System for Working Students.**

---

# 2. CRITICAL PLATFORM CHANGE

The previous prototype was designed as a responsive web application.

This MUST now be changed into a:

**MOBILE APPLICATION**

Design the entire application specifically for smartphones.

## Primary Design Frame

Use:

**390 × 844 px**

The design should also adapt reasonably to other common smartphone sizes.

## DO NOT

- Do not create desktop layouts
- Do not create tablet layouts
- Do not use a desktop sidebar
- Do not use a desktop-first layout
- Do not simply shrink the existing desktop UI
- Do not place too many cards side-by-side
- Do not use desktop tables unless absolutely necessary
- Do not use desktop navigation patterns

Instead, redesign every screen using proper mobile UX patterns.

---

# 3. TECHNOLOGY / CODE REQUIREMENT

The application will be implemented using:

**Flutter + Dart**

Therefore, design the prototype so that it can be realistically translated into a Flutter/Dart mobile application.

Use UI patterns that naturally correspond to Flutter widgets and mobile development.

Think in terms of:

- Scaffold
- AppBar
- NavigationBar
- BottomNavigationBar
- SafeArea
- ListView
- SingleChildScrollView
- Column
- Row
- Card
- Container
- TextField
- Form
- DropdownButton
- ChoiceChip
- FilterChip
- Switch
- Checkbox
- CircularProgressIndicator
- LinearProgressIndicator
- Dialog
- BottomSheet
- TabBar
- SnackBar
- FloatingActionButton where appropriate

Use reusable components and consistent spacing so the design can easily be implemented in Dart.

If the existing prototype contains generated code, update the implementation concept from web technologies to:

**Flutter / Dart**

Do not structure the new application around HTML/CSS/JavaScript.

---

# 4. BRAND CHANGE

Replace every instance of:

**WISE**

and:

**Working Student Intelligent Support Engine**

with:

**FARO**

and:

**Fatigue Assessment and Recommendation Optimizer**

There must be NO remaining references to WISE.

Update:

- Logo
- App name
- Login screen
- Splash screen
- Dashboard
- Navigation
- Headers
- Cards
- Empty states
- Notifications
- Reports
- Profile
- Settings
- Admin interface
- Sample data
- Illustrations
- Page titles
- Any generated code labels
- Any prototype documentation

The entire application must consistently use the FARO brand.

---

# 5. FARO LOGO

Create a simple modern logo for FARO.

The logo should communicate:

- Guidance
- Direction
- Fatigue awareness
- Balance
- Wellness
- Student support
- Growth

Possible visual ideas:

- Compass
- Direction/path
- Subtle brain
- Leaf
- Circular gauge
- Academic symbol
- Light/guide concept

Keep the logo:

- Minimal
- Professional
- Recognizable
- Suitable for a mobile app icon
- Suitable for a small navigation/header logo

Do not create an overly complicated logo.

---

# 6. DESIGN PERSONALITY

FARO should make students feel:

- Calm
- Supported
- Motivated
- Organized
- Safe
- In control
- Less stressed

The application should feel like:

**A wellness coach + academic productivity assistant**

rather than a strict productivity tracker.

The application should communicate that fatigue is something to understand and manage, not something to punish the student for.

---

# 7. AVOID THESE VISUAL STYLES

Do NOT make FARO look like:

- Cryptocurrency applications
- Gaming dashboards
- Hacker interfaces
- Neon AI websites
- Corporate ERP software
- Aggressive fitness applications
- Financial dashboards
- Overly futuristic AI interfaces

Avoid:

- Excessive neon colors
- Excessive gradients
- Excessive glassmorphism
- Extremely dense dashboards
- Excessive animations
- Tiny text
- Tiny buttons
- Overly complex charts

---

# 8. VISUAL DESIGN STYLE

Use:

- Modern
- Minimal
- Clean
- Calm
- Professional
- Academic
- Wellness-oriented
- Mobile-first
- Accessible

Use:

- Generous whitespace
- Rounded cards
- Soft shadows
- Subtle borders
- Clear visual hierarchy
- Friendly typography
- Clean charts
- Large readable values
- Consistent spacing
- Large touch targets

Cards:

**16px corner radius**

Buttons:

- Rounded
- Comfortable
- Easy to tap
- Clear labels
- Minimum comfortable touch target

---

# 9. COLOR PALETTE

Use the existing color palette as the foundation.

## Primary

`#2563EB`

Use for:

- Primary buttons
- Active navigation
- Important actions
- Primary data visualization

## Secondary

`#14B8A6`

Use for:

- Wellness
- Health-related information
- Secondary actions
- Supporting visualizations

## Success

`#22C55E`

Use for:

- Low fatigue
- Positive progress
- Completed recommendations
- Success states

## Warning

`#F59E0B`

Use for:

- Moderate fatigue
- Warnings
- Attention-required states

## Danger

`#EF4444`

Use carefully for:

- High fatigue
- Important alerts
- Critical warnings

## Background

`#F8FAFC`

## Card Background

`#FFFFFF`

## Primary Text

`#0F172A`

## Secondary Text

`#64748B`

## Borders

`#E2E8F0`

Charts may use:

- Blue
- Teal
- Purple
- Emerald
- Orange

Never use harsh neon colors.

---

# 10. TYPOGRAPHY

Use:

## Headings

**Poppins**

## Body

**Inter**

Use:

- Large readable headings
- Comfortable line height
- Clear hierarchy
- Accessible text sizes
- Mobile-friendly typography

Do not make body text excessively small.

---

# 11. MOBILE NAVIGATION

Replace the previous desktop sidebar with a mobile navigation system.

Use a **bottom navigation bar** for the primary student experience.

Recommended primary navigation:

1. Home
2. Daily Log
3. Fatigue
4. Recommendations
5. Profile

Use clear icons and labels.

The active navigation item should be visually obvious.

Additional screens such as:

- Calendar
- Analytics
- Reports
- Notifications
- Settings

can be accessed from:

- Profile
- More menu
- Secondary navigation
- Appropriate buttons within the application

Do not overcrowd the bottom navigation.

---

# 12. SPLASH SCREEN

Create a mobile splash screen.

Include:

- FARO logo
- FARO name
- Full application name
- Simple subtle loading animation

Suggested text:

**FARO**

**Fatigue Assessment and Recommendation Optimizer**

Optional supporting text:

**Understand your fatigue. Improve your balance.**

Keep the splash screen minimal.

---

# 13. LOGIN SCREEN

Create a mobile-first login screen.

Do NOT use the previous desktop split-screen login layout.

Instead use a vertically structured mobile layout.

Include:

- FARO logo
- FARO name
- Short description
- Email field
- Password field
- Remember Me
- Forgot Password
- Login button
- Register link
- University branding
- Small motivational/supportive message

Example:

**Welcome back**

**Let's help you understand your energy, manage your workload, and stay balanced.**

Make the login experience simple and clean.

---

# 14. REGISTER SCREEN

Create a mobile-friendly registration form.

Fields:

- First Name
- Middle Name
- Last Name
- Student Number
- College
- Course
- Year Level
- Employment Status
- Employment Type
- Company (Optional)
- Working Hours Per Week
- Email
- Password
- Confirm Password
- Terms and Conditions checkbox

Use:

- Scrollable form
- Proper field grouping
- Dropdowns where appropriate
- Clear validation states
- Large input fields
- Mobile-friendly keyboard behavior

Primary button:

**Create Account**

---

# 15. FORGOT PASSWORD

Create a simple mobile screen.

Include:

- FARO logo
- Email field
- Send Reset Link button
- Back to Login

Keep it minimal.

---

# 16. STUDENT HOME DASHBOARD

The previous desktop dashboard must be redesigned into a mobile dashboard.

Do NOT try to fit everything onto one screen.

Use a vertically scrollable layout.

## Header

Include:

- Greeting
- Student name
- Profile/avatar
- Notification icon

Example:

**Good morning, Deuz!**

**How are you feeling today?**

---

## Main Fatigue Card

Make fatigue one of the primary elements of the home screen.

Show:

- Current fatigue level
- Circular gauge
- Risk category
- Short explanation
- View Details button

Example:

**Moderate Fatigue**

**62%**

**Your current fatigue level suggests that you may benefit from a short break and adequate rest.**

---

## Productivity Summary

Show:

- Productivity score
- Study hours
- Work hours
- Sleep duration

Use compact mobile cards.

---

## Today's Recommendation

Show the most important recommendation prominently.

Example:

**Today's Recommendation**

**Take a 20-minute rest before continuing your study session.**

Include:

- Reason
- Priority
- Estimated impact
- Mark as completed

---

## Today's Activity

Show:

- Recent logs
- Study activity
- Work activity
- Sleep
- Breaks

---

## Weekly Overview

Include simple mobile-friendly charts.

Examples:

- Productivity trend
- Fatigue trend
- Sleep trend

Avoid overly complicated charts.

---

# 17. DAILY LOG

Create a mobile-friendly daily productivity log.

Fields:

- Date
- Sleep Duration
- Sleep Quality
- Study Hours
- Work Hours
- Class Hours
- Break Time
- Exercise
- Water Intake
- Mood
- Stress Level
- Energy Level
- Self-Reported Fatigue
- Productivity Rating
- Notes

Use appropriate mobile controls:

- Sliders
- Chips
- Dropdowns
- Number inputs
- Time pickers
- Rating controls

Group related fields into sections.

Example sections:

**Sleep**

**Academic**

**Work**

**Wellness**

**Fatigue & Productivity**

Do not display every field as one huge uninterrupted form.

Use collapsible sections or clearly separated cards where helpful.

Primary action:

**Save Daily Log**

---

# 18. CALENDAR

Create a mobile calendar screen.

Include:

- Current month
- Day selection
- Activity indicators
- Productivity indicators
- Fatigue indicators

When the user selects a date:

Show that day's:

- Productivity
- Fatigue
- Sleep
- Work hours
- Study hours
- Recommendations

Use a mobile bottom sheet or expandable section for the selected date.

---

# 19. FATIGUE ASSESSMENT

Create a dedicated mobile fatigue assessment screen.

The main element should be a large circular fatigue gauge.

Show:

**Predicted Fatigue Level**

Example:

**62%**

**Moderate**

Use clear risk levels:

- Low
- Moderate
- High

---

## Contributing Factors

Show factors such as:

- Sleep
- Work Hours
- Study Hours
- Stress
- Energy

Use horizontal progress indicators or compact cards.

Example:

**Sleep**

6.2 hrs

**Work**

8 hrs

**Study**

4 hrs

**Stress**

Moderate

**Energy**

Low

---

## Assessment Explanation

Include an understandable explanation of the prediction.

Avoid overly technical AI language.

Example:

**What may be affecting your fatigue?**

Your current fatigue level may be influenced by reduced sleep combined with long work and study hours.

---

## AI / Model Insight

Use a card such as:

**FARO Insight**

Provide a short explanation of the prediction.

Also show:

**Prediction Confidence**

Example:

**87%**

---

## Historical Trend

Include a simple mobile line chart showing fatigue over time.

---

# 20. RECOMMENDATIONS

Create a dedicated recommendations screen.

Recommendations should be personalized based on:

- Predicted fatigue
- Productivity
- Sleep
- Study hours
- Work hours
- Stress
- Energy

Categories:

- Sleep
- Study
- Work
- Exercise
- Hydration
- Mental Wellness
- Time Management
- Pomodoro

Each recommendation card should show:

- Recommendation title
- Short explanation
- Category
- Priority
- Estimated impact
- Completion checkbox/button

Example:

**Take a 20-minute break**

Priority: High

Estimated impact: High

Reason:

**Your current fatigue level is moderate and your recent study session has been lengthy.**

Button:

**Mark Complete**

---

# 21. ANALYTICS

Create a mobile analytics screen.

Do not copy a desktop analytics dashboard.

Use vertically stacked sections.

Include:

- Productivity
- Fatigue
- Sleep
- Study
- Work

Charts:

- Line charts
- Bar charts
- Simple comparison charts
- Progress indicators

Time filters:

- Weekly
- Monthly
- Semester

Use horizontally scrollable tabs or segmented controls.

Show useful summary statistics before detailed charts.

---

# 22. REPORTS

Create a mobile reports screen.

Allow users to generate:

- Weekly Report
- Monthly Report
- Semester Report

Show report preview cards.

Actions:

- Generate
- View
- Export

Export options:

- PDF
- CSV

Use mobile-friendly bottom sheets for export options.

---

# 23. NOTIFICATIONS

Create a mobile notification screen.

Use a chronological timeline/list.

Notification types:

- High Fatigue Alert
- Sleep Reminder
- Daily Reminder
- Weekly Summary
- Recommendation Reminder

Each notification should clearly communicate:

- What happened
- Why it matters
- What the student can do

Avoid alarming language.

For example:

Instead of:

**CRITICAL FATIGUE DETECTED**

Use:

**Your fatigue level is higher than usual**

**Consider taking a break and getting adequate rest.**

---

# 24. PROFILE

Create a mobile profile screen.

Include:

- Profile picture/avatar
- Name
- Student Number
- College
- Course
- Year Level
- Employment Information

Additional information:

- Goals
- Preferred Study Time
- Sleep Goal
- Notification Preferences

Use grouped settings cards.

---

# 25. SETTINGS

Create a mobile settings screen.

Sections:

## Preferences

- Dark Mode
- Language
- Notification Preferences

## Privacy & Security

- Privacy
- Security
- Password

## Account

- Delete Account
- Logout

Use standard mobile settings patterns.

---

# 26. ADMIN SIDE

FARO also requires an administrator side.

However, the admin interface must ALSO be designed as a mobile application.

Do not use the previous desktop admin dashboard.

The admin experience should use:

- Mobile cards
- Scrollable lists
- Bottom navigation or mobile navigation
- Compact charts
- Filters
- Search
- Bottom sheets
- Mobile dialogs

---

# 27. ADMIN DASHBOARD

Show:

- Total Students
- Today's Active Users
- Average Productivity
- Average Fatigue
- Prediction Accuracy
- System Usage

Use vertically stacked summary cards.

Charts:

- User activity
- Fatigue predictions
- Recommendations
- Daily logs

Prioritize readability over information density.

---

# 28. USER MANAGEMENT

Create a mobile-friendly user management screen.

Features:

- Search
- Filter
- Sort
- View User
- Add User
- Disable User
- Delete User
- Reset Password

Instead of a desktop data table, use mobile user cards/list items.

Each user card may show:

- Name
- Student number
- Course
- Employment status
- Account status

Tapping a user opens a detailed user screen or bottom sheet.

---

# 29. DATASET MANAGEMENT

Create a mobile dataset management screen.

Include:

- Upload Dataset
- Download Dataset
- Dataset Size
- Training Status
- Last Training Date
- Model Metrics

Use cards for important information.

---

# 30. MODEL PERFORMANCE

Create a mobile model performance screen.

The prediction model is:

**Decision Tree Regression**

Show:

- MAE
- RMSE
- R² Score
- Prediction Accuracy

Include a simplified residual chart.

The screen should communicate model performance clearly without overwhelming non-technical users.

---

# 31. REPORT MANAGEMENT

Create a mobile admin report management screen.

Include:

- System Reports
- User Reports
- Report date
- Report type
- View
- Export

Use mobile cards/lists rather than large desktop tables.

---

# 32. SYSTEM SETTINGS

Create a mobile admin settings screen.

Include:

- Application Configuration
- Security
- Roles
- Permissions
- Notifications

Use grouped mobile settings.

---

# 33. EMPTY STATES

Create polished empty states.

Use friendly illustrations and messages.

Examples:

**No logs yet.**

**Let's start tracking today.**

**No recommendations yet.**

**Your personalized recommendations will appear here.**

**No notifications.**

**You're all caught up.**

---

# 34. ERROR STATES

Error messages should be:

- Friendly
- Clear
- Non-alarming
- Actionable

Never use overly technical error messages.

Example:

Instead of:

**Prediction API Error 500**

Use:

**We couldn't calculate your fatigue level right now.**

**Please try again in a moment.**

---

# 35. SUCCESS STATES

Use subtle positive feedback.

Examples:

- Green checkmark
- Small success animation
- Confirmation message
- Subtle celebration

Avoid excessive confetti or distracting animations.

Example:

**Daily log saved!**

**Your information has been recorded successfully.**

---

# 36. MICRO-INTERACTIONS

Use subtle mobile animations.

Examples:

- Smooth page transitions
- Card press states
- Button press animations
- Progress animations
- Loading skeletons
- Pull-to-refresh where appropriate
- Bottom sheet transitions
- Checkbox completion animations

Animations should feel:

- Smooth
- Calm
- Professional

Do not over-animate the application.

---

# 37. ACCESSIBILITY

Follow accessibility principles equivalent to:

**WCAG AA**

Use:

- High contrast
- Readable text
- Large touch targets
- Clear labels
- Accessible icons
- Proper error states
- Clear focus/interaction states
- Do not rely on color alone to communicate fatigue levels

For example:

Low fatigue should not be represented only by green.

Use:

**Low**

Moderate:

**Moderate**

High:

**High**

along with color and icons.

---

# 38. RESPONSIVE MOBILE BEHAVIOR

Although the primary design frame is:

**390 × 844**

the interface should still adapt to different smartphone sizes.

Consider:

- 360px wide phones
- 390px wide phones
- 412px wide phones
- Larger modern phones

Use flexible layouts rather than fixed-width desktop elements.

Avoid horizontal overflow.

---

# 39. DESIGN SYSTEM

Create reusable components.

Components should include:

- FARO Logo
- Buttons
- Text Fields
- Dropdowns
- Cards
- Stat Cards
- Fatigue Gauge
- Productivity Gauge
- Recommendation Cards
- Progress Bars
- Charts
- Badges
- Chips
- Navigation Bar
- App Bar
- Dialogs
- Bottom Sheets
- Alerts
- Notifications
- Empty States
- Error States
- Success States
- User Cards
- Report Cards

Create consistent component states:

- Default
- Pressed
- Disabled
- Loading
- Error
- Success
- Selected

---

# 40. STUDENT USER FLOW

Use this primary mobile flow:

Splash Screen
↓
Login / Register
↓
Home
↓
Daily Log
↓
Fatigue Assessment
↓
Recommendations
↓
Analytics
↓
Reports
↓
Profile / Settings

The main student navigation should prioritize:

**Home**

**Daily Log**

**Fatigue**

**Recommendations**

**Profile**

---

# 41. ADMIN USER FLOW

Use:

Login
↓
Admin Home
↓
Users
↓
Dataset
↓
Model Performance
↓
Reports
↓
System Settings

Keep the admin navigation mobile-friendly.

---

# 42. SAMPLE DATA

Use realistic sample data for a working student.

Example:

Student:

**Deuz Wendrick**

Course:

**BS Computer Science**

Employment:

**Working Student**

Example daily data:

Sleep:

**6.2 hours**

Work:

**8 hours**

Study:

**4 hours**

Stress:

**Moderate**

Energy:

**Low**

Fatigue:

**62% — Moderate**

Productivity:

**78%**

Prediction Confidence:

**87%**

Use realistic variations throughout the application.

---

# 43. IMPORTANT UX PRINCIPLE

FARO should NOT make students feel judged.

The system should communicate:

**"Here is what your data tells us, and here is how we can help."**

Not:

**"You are performing badly."**

Fatigue should be presented as useful information for self-awareness and decision support.

Recommendations should be supportive rather than commanding.

---

# 44. THESIS PRESENTATION QUALITY

The final prototype must look polished enough to present to a thesis panel.

It should demonstrate:

- Clear system purpose
- Strong mobile UX
- Consistent branding
- Meaningful fatigue visualization
- Personalized recommendations
- Productivity monitoring
- Data-driven insights
- Student-focused design
- Administrator functionality
- Professional design system
- Realistic sample data
- Clear navigation
- Developer-friendly component structure

---

# 45. FINAL OUTPUT

Create approximately:

**20–25 interconnected mobile screens**

Use:

- Reusable components
- Auto Layout
- Consistent spacing
- Consistent typography
- Consistent colors
- Realistic sample data
- Mobile interactions
- Bottom navigation
- Mobile dialogs
- Bottom sheets
- Interactive charts
- Loading states
- Empty states
- Error states
- Success states

The final result should look like a:

**production-ready Flutter mobile application prototype**

for a university thesis project.

The application name must be:

# FARO

**Fatigue Assessment and Recommendation Optimizer**

The implementation direction must be:

# Flutter + Dart

The design direction must be:

# Mobile-first, mobile-only

Do not revert to the previous WISE branding or desktop web application structure.