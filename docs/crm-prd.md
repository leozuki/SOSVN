# Product Requirement Document (PRD)

## CRM System (HubSpot-like)

---

## 1. Product Overview

### 1.1 Objective

Xây dựng hệ thống CRM tương tự HubSpot nhằm quản lý toàn bộ vòng đời khách hàng: từ lead → deal → chăm sóc → vận hành nội bộ.

### 1.2 Goals

- Tăng hiệu quả quản lý khách hàng & sales pipeline
- Chuẩn hóa quy trình vận hành
- Tối ưu conversion rate và doanh thu
- Làm nền tảng phát triển SaaS CRM trong tương lai

### 1.3 Target Users

- Sales Team
- Customer Service (CS)
- Marketing Team
- Management / Admin

---

## 2. Product Scope

### 2.1 In Scope (MVP)

- User & Permission Management
- Contact Management
- Deal & Pipeline Management
- Ticket Management
- Task Management
- Meeting Management
- Basic Reporting Dashboard

### 2.2 Out of Scope (Phase 2+)

- Marketing Automation
- AI Scoring / Prediction
- Advanced Workflow Automation
- Third-party integrations (limited ở MVP)

---

## 3. User Roles & Permissions

### 3.1 Roles

- Admin
- Manager
- Sales
- Customer Service
- Marketing

### 3.2 Permission Model

Áp dụng RBAC (Role-Based Access Control):

- Module-level: Contact, Deal, Ticket, Task...
- Action-level: View / Create / Edit / Delete

### 3.3 Special Rules

- Manager xem được data team
- Sales chỉ xem data assigned
- Admin toàn quyền

---

## 4. Functional Requirements

### 4.1 User Management

- Tạo / sửa / xóa user
- Phân quyền theo role
- Audit log hoạt động user

### 4.2 Contact Management

#### Features

- Lưu trữ thông tin khách hàng (name, phone, email, company...)
- Tagging & segmentation
- Import/export CSV
- Lịch sử tương tác (call, email, meeting)

#### Rules

- Không duplicate contact (email/phone unique)
- Merge contact khi trùng

### 4.3 Deal Management (Pipeline)

#### Features

- Pipeline customizable (Lead → Qualified → Proposal → Won/Lost)
- Drag & drop deal
- Gắn deal với contact/company
- Forecast doanh thu

#### Metrics

- Conversion rate theo stage
- Revenue theo pipeline

### 4.4 Ticket Management

#### Features

- Tạo ticket hỗ trợ
- Phân loại: Priority / Status / Type
- Gán ticket cho CS
- SLA tracking

#### Status

- Open
- In Progress
- Resolved
- Closed

### 4.5 Task Management

#### Features

- Tạo task
- Assign user
- Deadline + reminder
- Link với deal/contact/ticket

#### Status

- Todo
- In Progress
- Done

### 4.6 Meeting Management

#### Features

- Tạo lịch họp
- Gắn với contact/deal
- Ghi chú nội dung
- Notification

---

## 5. Data Model (High-level)

### Entities

- Users
- Roles
- Contacts
- Companies
- Deals
- Pipelines
- Tickets
- Tasks
- Meetings
- Activities

### Relationships

- Contact ↔ Deal (1:N)
- Deal ↔ Task (1:N)
- Contact ↔ Ticket (1:N)
- User ↔ All entities (assigned)

---

## 6. Non-functional Requirements

### 6.1 Performance

- Response time < 300ms
- Support 10,000+ contacts (MVP)

### 6.2 Security

- JWT Authentication
- Role-based access
- Data encryption

### 6.3 Scalability

- Modular architecture
- Ready for multi-tenant

---

## 7. System Architecture

### Suggested Stack

- Frontend: React / Vue
- Backend: Node.js / NestJS
- Database: PostgreSQL
- API: REST / GraphQL
- Deployment: AWS / GCP

---

## 8. UI/UX Requirements

### Dashboard

- Tổng quan KPI: Deals, Revenue, Tasks

### Main Screens

- Contact List + Detail View
- Deal Pipeline (Kanban)
- Ticket Board
- Task List
- Calendar (Meeting)

---

## 9. Reporting & Analytics

- Sales performance
- Pipeline conversion
- Ticket resolution time
- Task completion rate

---

## 10. Roadmap

### Phase 1 (0-2 tháng)

- Core modules (Contact, Deal, Task)

### Phase 2 (2-4 tháng)

- Ticket, Meeting, Reporting

### Phase 3 (4-6 tháng)

- Automation, Integration

---

## 11. Success Metrics

- Tăng conversion rate ≥ 20%
- Giảm thời gian xử lý lead ≥ 30%
- Adoption rate nội bộ ≥ 80%

---

## 12. Risks & Assumptions

### Risks

- User adoption thấp
- Data không sạch

### Assumptions

- Có team dev nội bộ
- Có CRM process sẵn

---

## 13. Future Expansion

- Marketing Automation
- AI Lead Scoring
- Omnichannel CRM
- SaaS commercialization

---

## 14. Detailed Business Logic & Rules (Core)

### 14.1 User & Permission Logic

#### Role Hierarchy

- Admin > Manager > Staff

#### Rules

- Admin
  - Full access all modules
  - Can assign/revoke roles
- Manager
  - View/Edit data of team members
  - Cannot delete system-level configs
- Staff
  - Only access own assigned data

#### Data Access Logic

- If (user.role == Staff) → only see assigned records
- If (user.role == Manager) → see team records
- If (user.role == Admin) → see all records

#### Audit Log

- Track: create/update/delete/login
- Store: user_id, action, timestamp, entity_id

### 14.2 Contact Management Logic

#### Create Contact

- Required: phone OR email
- Validate
  - Phone unique
  - Email unique

#### Duplicate Handling

- If phone/email exists:
  - show warning
  - allow merge OR create anyway (flag duplicate)

#### Contact Status

- New Lead
- Contacted
- Qualified
- Customer
- Lost

#### Activity Tracking

- Auto log when:
  - Call created
  - Meeting created
  - Deal attached

#### Assignment Rule

- Default assign to creator
- Can reassign manually

### 14.3 Deal & Pipeline Logic

#### Pipeline Structure

- Custom stages per company

#### Default Stages

- Lead → Qualified → Proposal → Negotiation → Won/Lost

#### Rules

- Deal must belong to 1 Contact
- Deal value must > 0

#### Stage Movement

- Drag & drop allowed
- When move stage:
  - Update timestamp
  - Log activity

#### Auto Logic

- If stage = Won → mark contact = Customer
- If stage = Lost → require reason

#### Forecast

- Revenue = sum(deal.value * probability)

### 14.4 Ticket Management Logic

#### Create Ticket

- Required: contact_id, title

#### Priority

- Low / Medium / High / Urgent

#### SLA Rules

- High: respond < 2h
- Medium: < 8h
- Low: < 24h

#### Status Flow

- Open → In Progress → Resolved → Closed

#### Rules

- Cannot close if not resolved
- Must log resolution note

### 14.5 Task Management Logic

#### Task Fields

- Title
- Assignee
- Deadline
- Related entity (optional)

#### Rules

- Deadline required
- Reminder before 1h / 24h

#### Status Flow

- Todo → In Progress → Done

#### Automation

- When deal created → auto create follow-up task

### 14.6 Meeting Logic

#### Create Meeting

- Required: time, participants

#### Rules

- Cannot overlap same user schedule
- Send notification before 15 mins

#### After Meeting

- Require note
- Optional: create task

---

## 15. Page-level Spec (UI Logic)

### 15.1 Dashboard

#### Components

- Total Deals
- Revenue
- Tasks overdue

#### Rules

- Data filtered by role

### 15.2 Contact Page

#### List View

- Search (name, phone, email)
- Filter (status, tag, owner)

#### Detail View

- Profile info
- Activity timeline
- Related deals/tasks/tickets

### 15.3 Deal Pipeline Page

#### UI

- Kanban board

#### Actions

- Drag deal
- Click → open detail

#### Rules

- Cannot move to Won without value

### 15.4 Ticket Page

#### List

- Filter by status/priority

#### Detail

- Conversation log
- SLA timer

### 15.5 Task Page

#### Views

- List view
- My tasks

#### Rules

- Highlight overdue tasks

### 15.6 Calendar (Meeting)

#### Views

- Day / Week / Month

#### Rules

- Sync with meeting module

---

## 16. Validation Rules (Global)

- Email format check
- Phone number format (country-based)
- Required fields cannot be null

---

## 17. Event & Automation Logic (MVP Light)

- Create deal → create task
- Move deal stage → log activity
- Create meeting → notify participants

---

## 18. Error Handling

- API errors standardized
- UI show clear message

---

## 19. Logging & Tracking

- Track all CRUD actions
- Store system logs for debugging

---

## 20. Database Schema (Detailed)

### Users

- id (PK)
- name
- email (unique)
- password_hash
- role_id
- status
- created_at

### Roles

- id (PK)
- name

### Contacts

- id (PK)
- name
- phone (unique)
- email (unique)
- status
- owner_id
- created_at

### Deals

- id (PK)
- contact_id (FK)
- value
- stage
- probability
- owner_id
- created_at

### Tickets

- id (PK)
- contact_id
- title
- status
- priority
- assigned_to

### Tasks

- id (PK)
- title
- status
- deadline
- assigned_to

### Meetings

- id (PK)
- title
- start_time
- end_time

---

## 21. API Spec (Core)

### Auth

- POST /auth/login
- POST /auth/register

### Contacts

- GET /contacts
- POST /contacts
- PUT /contacts/{id}
- DELETE /contacts/{id}

### Deals

- GET /deals
- POST /deals
- PUT /deals/{id}/stage

### Tickets

- GET /tickets
- POST /tickets

### Tasks

- GET /tasks
- POST /tasks

---

## 22. User Flow

### Sales Flow

1. Create Contact
2. Create Deal
3. Move pipeline stages
4. Close deal

### CS Flow

1. Receive ticket
2. Assign
3. Resolve

---

## 23. Permission Matrix (Simplified)

| Role    | Contact     | Deal     | Ticket   | Task |
| ------- | ----------- | -------- | -------- | ---- |
| Admin   | CRUD        | CRUD     | CRUD     | CRUD |
| Manager | CRUD (team) | CRUD     | CRUD     | CRUD |
| Staff   | Own only    | Own only | Assigned | Own  |

---

## 24. Automation Workflow

- Deal created → Task created
- Deal won → update contact
- Ticket created → notify CS

---

## 25. UI Flow (Wireframe Logic)

### Contact Detail Page

- Header: Name + status
- Tabs: Activity | Deals | Tasks | Tickets

### Deal Page

- Kanban pipeline

### Dashboard

- KPI cards

---

## 26. System Architecture Detail

- Frontend → API Gateway → Services
- Services:
  - Auth Service
  - CRM Service
  - Notification Service

---

## 27. Scaling Plan

- Phase 1: Monolith
- Phase 2: Microservices

---

## 28. SaaS Readiness

- Multi-tenant DB
- Subscription model
- Billing integration

---

End of document.
