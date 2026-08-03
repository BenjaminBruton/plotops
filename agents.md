Project Vision
A "Cradle-to-Grave" Film Production ERP that ingests a screenplay and orchestrates the entire lifecycle of a film project. The app is a multi-tenant, role-based workspace where AI assists with data entry and logistics, but humans retain full creative and operational control.

1. Core Architectural Principles
Role-Based Access Control (RBAC): Users are assigned roles (Producer, AD, Casting Director, Scout, Editor, Publicist). Each role has a unique dashboard view and set of permissions.

AI-Assisted, Human-Validated: The system suggests (breaks down scripts, clusters scenes, allocates budgets), but every AI output must be editable or deletable by the user.

State Management: Use Supabase for the real-time database to ensure "The Wrap" and "Daily Progress" updates are reflected instantly for all stakeholders.

Automation Engine: Use n8n for heavy lifting like PDF generation (Call Sheets), Script Parsing (LLM), and notification triggers.

2. Functional Modules & Workflows
A. Script Ingestion & Breakdown (Producer View)
Input: PDF or .fdx file upload.

Processing: Extract JSON data including:

Scenes: Scene #, Int/Ext, Day/Night, Location Name, Page Count.

Characters: Identifying speaking roles and "Under-fives."

Props/Assets: Identifying physical items mentioned in action lines.

Output: An editable "Breakdown Table" where Producers can manually add/remove items and set preliminary budget tags (1–5 scale for complexity).

B. Casting & Public Job Board
Public Side: A /casting route for the public to view "Casting Calls" (Syncs with internal Project roles).

Internal Side: A Kanban-style "Casting Manager."

Auto-import character descriptions from the Script Ingestion.

Allow manual entry of "Sides" (script snippets for auditions).

Attachment system for Headshots and Video Demo Reels.

C. Logistics & The Stripboard (AD & Scout View)
The Stripboard: A drag-and-drop timeline.

Logic: Suggest clusters based on Location and Actor Availability (Metadata matching).

Mapping: Integrate Google Maps API for Location Scouts to pin locations, upload site photos, and mark logistics (Parking, Power, Signal).

Call Sheets: One-click "Generate Call Sheet" button. Merges Scene data + Weather API + Location Map + Hospital Info into a branded PDF.

D. Production Monitoring (On-Set View)
Real-time "Wrap" Tracker: A mobile-responsive checklist for the Script Supervisor.

Progress Monitoring: Compare Scheduled Scene End Time vs. Actual Wrap Toggle.

Alerts: Push notifications/Emails to the Producer if a scene is missed or the crew is "In the red" on time.

E. Asset & Post-Production Management
Digital Asset Management (DAM): A log for raw footage metadata.

Collaborative Tagging: Editors/Directors tag clips with #VFX-Needed, #Foley, or #ADR.

Feedback Loop: A "Flag for Reshoot" button that automatically creates a task back in the AD's Stripboard module.

3. Technical Stack
Framework: Next.js (App Router).

Database/Auth: Supabase (PostgreSQL + RLS).

Styling: Tailwind CSS + Shadcn UI.

Automations: n8n (hosted or self-hosted).

Maps: Google Maps JavaScript API.

State/Real-time: Supabase Realtime (for "The Wrap" notifications).

4. Data Schema Strategy (For AI Developer)
The AI Agent should prioritize building these relational links:

Project -> Scenes

Scenes -> Locations (Map Pins)

Scenes -> Cast (Actors assigned to roles)

Scenes -> Schedule (Stripboard order)