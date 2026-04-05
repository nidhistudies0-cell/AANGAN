AANGAN 🏠Making Hostel Life Easier, One Connection at a Time.AANGAN is a comprehensive lifestyle mobile application designed to streamline communication, collaboration, and resource sharing within student hostels. From academic research to emergency SOS alerts, AANGAN serves as the digital backbone of the hostel community.

🚀 Core Features🎓 Student Interface
1. CoLab (Project Collaboration)Purpose: A platform for students to pitch ideas and find research/project partners.Action: Create posts with details like discipline, year, and project idea.Interaction: Interested students can join a group chat (restricted by a member limit set by the creator).
2. Share Ring (Borrowing & Lending)
Purpose: A secure peer-to-peer resource sharing system.Action: Post borrow requests mentioning the item and duration.Security: Features a rating and feedback system. Lenders provide proof (images) and rate borrowers post-return.Automation: Borrowers receive automated push notifications when return deadlines approach.
3. InSync (Leisure & Social)Purpose: Finding companions for fun activities, outings, or hobbies.Details: Posts include Date, Time, Budget, and Activity Name.Discovery: Users can search and filter activities based on their interests (Music, Dance, Gaming, etc.).
4. Emergency & SOSSafety First: Dedicated triggers for medical emergencies, fire hazards, or natural disasters.Alerts: High-priority pop-up notifications sent instantly to all residents and the Warden's office.
🔑 Authentication & OnboardingStudents: Sign-in via Institutional Student Mail ID.Profile Setup: New users input Name, Hostel Block, Branch, Course Year, and Hobbies/Interests.Admins: Sign-in via Employee Mail ID.

🛠️ Admin Interface (Warden & Committee)Official Notices: Warden’s office can broadcast formal announcements.Event Management: Hostel committees can create and manage hostel-wide events.Emergency Control: Authorized personnel can trigger high-level emergency alerts.

💻 Tech Stack (Proposed) Layer Technology 
Frontend React Native / Expo (Cross-platform iOS & Android)
Backend/AuthFirebase (Authentication, Firestore, Cloud Messaging)
Styling Styled Components / Tailwind CSS State Mgmt React Context API / Redux Toolkit Communication Firebase Real time Database (for Group Chats)


📂 Project StructurePlaintextAANGAN/
├── assets/             # Images, Fonts, and Icons
├── src/
│   ├── components/     # Reusable UI components (Buttons, Cards, Inputs)
│   ├── navigation/     # Auth, App, and Admin Navigators
│   ├── screens/
│   │   ├── Auth/       # Login, Signup, Onboarding
│   │   ├── CoLab/      # Project creation and joining
│   │   ├── ShareRing/  # Borrow/Lend requests and Ratings
│   │   ├── InSync/     # Social activity feed
│   │   └── Admin/      # Warden/Committee Dashboard
│   ├── firebase/       # Firebase config and utility functions
│   ├── theme/          # Global styles and colors
│   └── utils/          # Helper functions (Date formatting, Validations)
├── .env                # Environment variables (Firebase Keys)
└── App.tsx             # Main entry point


🛠️ Installation & SetupClone the repository:Bashgit clone https://github.com/yourusername/AANGAN.git
cd AANGAN
Install dependencies: Bash npm install
Configure Firebase: Create a project in Firebase Console.
Enable Email/Password Auth and Firestore.
Create a .env file in the root directory and add your Firebase credentials.
Run the app: Bash npx expo start

📢 Notifications Logic Local Notifications: For borrowing reminders and chat messages.
Global Broadcasts: For Emergency SOS (Pop-ups) and Warden Announcements.
Context-Aware: CoLab and Share Ring requests are primarily visible to users within the same hostel block/compound.

🤝 Contributing Contributions are welcome! Please open an issue or submit a pull request for any feature suggestions or bug fixes.
