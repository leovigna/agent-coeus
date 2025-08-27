# Domain Schemas

This package contains the Zod schemas for the core domain entities used across the Coeus Agent ecosystem.

## Schemas

- [CRM](#crm)
    - [Company](#company)
    - [Person](#person)
    - [Tag](#tag)
    - [Relationship](#relationship)
- [Email (Future)](#email-future)
    - [EmailAccount](#emailaccount)
    - [EmailMessage](#emailmessage)
- [Calendar (Future)](#calendar-future)
    - [Calendar](#calendar)
    - [CalendarEvent](#calendarevent)
- [Project Management (Future)](#project-management-future)
    - [Project](#project)
    - [Task](#task)
- [Documents (Future)](#documents-future)
    - [Document](#document)
    - [Folder](#folder)

### CRM

#### Company
A company or organization that is tracked in the CRM.
-   `id`: (string) - The unique identifier for the company.
-   `name`: (string) - The name of the company.
-   `domain`: (string, optional) - The company's primary domain (e.g., `example.com`).
-   `industry`: (string, optional) - The industry the company operates in.
-   `size`: (enum, optional) - The size of the company (`startup`, `small`, `medium`, `large`, `enterprise`).
-   `location`: (object, optional) - The geographical location of the company.
-   `description`: (string, optional) - A brief description of the company.
-   `employee_count`: (number, optional) - The number of employees.
-   `founded_year`: (number, optional) - The year the company was founded.
-   `website`: (string, optional) - The company's official website URL.
-   `tags`: (array, optional) - An array of `Tag` schemas associated with the company.
-   `metadata`: (record, optional) - A flexible object for storing additional custom data.
-   `created_at`: (string) - The timestamp when the company was created.
-   `updated_at`: (string) - The timestamp of the last update.

#### Person
An individual person, typically a contact associated with a company.
-   `id`: (string) - The unique identifier for the person.
-   `name`: (string) - The full name of the person.
-   `email`: (string, optional) - The person's email address.
-   `phone`: (string, optional) - The person's phone number.
-   `telegram`: (string, optional) - The person's Telegram handle.
-   `title`: (string, optional) - The person's job title.
-   `department`: (string, optional) - The department the person works in.
-   `location`: (object, optional) - The geographical location of the person.
-   `linkedin_url`: (string, optional) - The URL of the person's LinkedIn profile.
-   `tags`: (array, optional) - An array of `Tag` schemas associated with the person.
-   `metadata`: (record, optional) - A flexible object for storing additional custom data.
-   `created_at`: (string) - The timestamp when the person was created.
-   `updated_at`: (string) - The timestamp of the last update.

#### Tag
A label that can be applied to entities like `Company` or `Person` for categorization and filtering.
-   `id`: (string) - The unique identifier for the tag.
-   `name`: (string) - The name of the tag (e.g., "Lead", "Customer").
-   `color`: (string, optional) - A color code (e.g., hex) to visually represent the tag.

#### Relationship
Defines a typed connection between two entities, such as a person working at a company.
-   `type`: (enum) - The type of relationship (e.g., `WORKS_AT`, `REPORTS_TO`).
-   `from`: (string) - The UUID of the source entity in the relationship.
-   `to`: (string) - The UUID of the target entity in the relationship.
-   `properties`: (record, optional) - A flexible object for storing additional data about the relationship.
-   `startDate`: (string, optional) - The date when the relationship began.
-   `endDate`: (string, optional) - The date when the relationship ended.

### Email (Future)

#### EmailAccount
Represents a user's email account connected to the system.
-   `id`, `provider`, `email_address`, `credentials`

#### EmailMessage
Represents a single email message.
-   `id`, `from`, `to`, `cc`, `bcc`, `subject`, `body`, `sent_at`, `received_at`

### Calendar (Future)

#### Calendar
Represents a user's calendar.
-   `id`, `name`, `owner`, `provider`

#### CalendarEvent
Represents an event on a calendar.
-   `id`, `title`, `description`, `start_time`, `end_time`, `attendees`, `location`

### Project Management (Future)

#### Project
Represents a project that can contain tasks.
-   `id`, `name`, `description`, `status`, `owner`

#### Task
Represents a single task within a project.
-   `id`, `title`, `description`, `status`, `assignee`, `due_date`, `project_id`

### Documents (Future)

#### Document
Represents a text-based document or note.
-   `id`, `title`, `content`, `format`, `folder_id`

#### Folder
Represents a folder to organize documents.
-   `id`, `name`, `parent_folder_id`
