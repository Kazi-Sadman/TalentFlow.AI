# Architecture

```
Candidate / Recruiter (Swagger, Postman, future UI)
        |
        v
ASP.NET Core Web API
  Middleware: ExceptionMiddleware -> HTTPS -> RateLimiter -> Authentication -> Authorization
        |
        v
Controllers  (HTTP in / out, DTOs, [Authorize] policies)
        |
        v
Services     (business rules, ownership checks, workflow)
        |                    \
        v                     +--> SkillMatchingService (rule-based) / ResumeParserService (PdfPig)
Entity Framework Core (Npgsql)
        |
        v
PostgreSQL

CV files: PrivateStorage/resumes (outside wwwroot, random names, permission-checked download)
```

## Layers

| Layer | Responsibility | Examples |
| --- | --- | --- |
| Controllers | Receive request, read the user from the JWT, call a service | JobsController |
| DTOs | The exact data shape of requests/responses | CreateJobRequest |
| Services | Business rules and use cases | ApplicationService |
| Data | DbContext, entity configuration, migrations | TalentFlowDbContext |
| Entities | Database classes | Job, Application |
| Authorization | Role policies and ownership check | ApplicationAccess |
| Middleware | One error format for the whole API | ExceptionMiddleware |

## Application status workflow

```
Applied -> InReview -> Shortlisted -> Interview -> Offered
   \           \            \             \
    +-----------+------------+-------------+--> Rejected
```
`Offered` and `Rejected` are final. Every change is saved in `AuditLogs`.

## Job status workflow

`Draft -> Published -> Closed` (Draft can also go directly to Closed). A closed job cannot be edited or reopened.

## Skill matching

```
Job.RequiredSkills + CV text
   -> split skills -> find whole-word matches (aliases such as "postgres" = "PostgreSQL")
   -> Matched (with evidence snippet) / Missing / Needs review
   -> Saved in AIAnalyses (Status: Processing -> Completed | Failed)
   -> Recruiter reviews and decides
```
