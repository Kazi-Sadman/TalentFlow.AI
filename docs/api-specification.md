# API specification

All errors have this shape:

```json
{ "statusCode": 409, "message": "You have already applied for this job.", "errors": [] }
```
Status codes used: 200, 201, 204, 400, 401, 403, 404, 409, 413, 422, 429, 500.
Send the token as `Authorization: Bearer <token>`. List endpoints accept `page` and `pageSize` (max 50).

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| POST | /api/auth/register | Public | Create Candidate or Recruiter (recruiter needs `companyName`) |
| POST | /api/auth/login | Public | Get JWT token |
| GET | /api/jobs | Public | Published jobs. Query: `search`, `skill`, `experienceLevel` |
| GET | /api/jobs/mine | Recruiter | All jobs of my company. Query also has `status` |
| GET | /api/jobs/{id} | Public | Job details (draft only for its company) |
| POST | /api/jobs | Recruiter | Create job |
| PATCH | /api/jobs/{id} | Recruiter (same company) | Edit job / change status |
| DELETE | /api/jobs/{id} | Recruiter | Delete a draft job |
| POST | /api/jobs/{id}/apply | Candidate | Apply (body `{}` or `{ "resumeId": 3 }`) |
| GET | /api/applications/me | Candidate | My applications |
| GET | /api/jobs/{id}/applications | Recruiter (same company) | Applicants. Query: `status`, `search` |
| GET | /api/applications/{id} | Owner candidate / same-company recruiter | Application details |
| PATCH | /api/applications/{id}/status | Recruiter | Change status (+ private notes) |
| GET / PUT | /api/profile/me | Candidate | View / edit my profile |
| POST | /api/resumes | Candidate | Upload PDF (`multipart/form-data`, field `file`) |
| GET | /api/resumes/me | Candidate | My resumes + detected skills |
| GET | /api/resumes/{id}/download | Owner / recruiter who received it | Download CV |
| POST | /api/applications/{id}/ai-analysis | Owner candidate / same-company recruiter | Run skill analysis |
| GET | /api/applications/{id}/ai-analysis | same | Latest analysis |
| POST | /api/applications/{id}/interviews | Recruiter | Schedule interview (application must be Shortlisted/Interview) |
| GET | /api/applications/{id}/interviews | Owner candidate / recruiter | List interviews (feedback only for recruiters) |
| PATCH | /api/interviews/{id}/feedback | Recruiter | Save private feedback |
| GET | /api/dashboard/summary | Recruiter | Counts and pipeline |
| GET | /health | Public | Health check |

## Examples

Register a recruiter:
```json
{ "fullName": "Rina Akter", "email": "rina@company.com", "password": "Strong123", "role": "Recruiter", "companyName": "Acme Ltd" }
```

Create a job:
```json
{ "title": ".NET Trainee", "description": "Build APIs", "requiredSkills": "C#, ASP.NET Core, PostgreSQL",
  "experienceLevel": "Intern", "status": "Published", "deadline": "2027-01-31T00:00:00Z" }
```

Change application status:
```json
{ "status": "Shortlisted", "recruiterNotes": "Strong C# basics" }
```

Create an interview:
```json
{ "startAtUtc": "2027-01-10T09:00:00Z", "endAtUtc": "2027-01-10T10:00:00Z", "meetingLink": "https://meet.example.com/abc" }
```
