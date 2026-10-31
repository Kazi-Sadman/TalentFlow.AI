import { Anchor, Box, Button, Divider, Grid, Group, Paper, Skeleton, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconDownload, IconFileText } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { applicationsApi, resumesApi } from "../../api/endpoints";
import AiAnalysisPanel from "../../components/application/AiAnalysisPanel";
import ApplicationTimeline from "../../components/application/ApplicationTimeline";
import InterviewSection from "../../components/application/InterviewSection";
import StatusUpdatePanel from "../../components/application/StatusUpdatePanel";
import ErrorAlert from "../../components/common/ErrorAlert";
import SkillChips from "../../components/common/SkillChips";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import type { ApplicationDetail } from "../../types";
import { formatBytes, formatDate, splitSkills } from "../../utils/format";

function CandidatePanel({ application }: { application: ApplicationDetail }) {
  const skills = splitSkills(application.candidateSkills);

  return (
    <Paper p="lg">
      <Title order={4} mb="md">
        Candidate
      </Title>
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Text size="xs" c="dimmed">
            Email
          </Text>
          <Text size="sm" fw={600} className="break-anywhere">
            {application.candidateEmail}
          </Text>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Text size="xs" c="dimmed">
            Experience
          </Text>
          <Text size="sm" fw={600}>
            {application.candidateExperienceYears} {application.candidateExperienceYears === 1 ? "year" : "years"}
          </Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Text size="xs" c="dimmed">
            Education
          </Text>
          <Text size="sm">{application.candidateEducation ? application.candidateEducation : "Not added"}</Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Text size="xs" c="dimmed">
            Summary
          </Text>
          <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
            {application.candidateSummary ? application.candidateSummary : "Not added"}
          </Text>
        </Grid.Col>
        <Grid.Col span={12}>
          <Text size="xs" c="dimmed" mb={6}>
            Skills the candidate listed
          </Text>
          {skills.length > 0 ? <SkillChips skills={skills} /> : <Text size="sm">Not added</Text>}
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

function ResumePanel({ application }: { application: ApplicationDetail }) {
  const [downloading, setDownloading] = useState(false);
  const resume = application.resume;

  async function handleDownload() {
    if (resume === null) {
      return;
    }
    setDownloading(true);
    try {
      await resumesApi.download(resume.id, resume.originalFileName);
    } catch (error) {
      notifications.show({ color: "red", title: "Could not download", message: getErrorMessage(error) });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Paper p="lg">
      <Title order={4} mb="md">
        CV
      </Title>

      {resume === null ? (
        <Text size="sm" c="dimmed">
          No CV was attached to this application.
        </Text>
      ) : (
        <Stack gap="md">
          <Group justify="space-between" wrap="nowrap" gap="md">
            <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
              <ThemeIcon size={40} radius="md" variant="light" color="red">
                <IconFileText size={22} />
              </ThemeIcon>
              <Box style={{ minWidth: 0 }}>
                <Text fw={600} size="sm" className="break-anywhere">
                  {resume.originalFileName}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatBytes(resume.sizeBytes)}, uploaded {formatDate(resume.uploadedAt)}
                </Text>
              </Box>
            </Group>
            <Button size="xs" variant="default" leftSection={<IconDownload size={15} />} loading={downloading} onClick={handleDownload}>
              Download
            </Button>
          </Group>

          <Divider />

          <Box>
            <Text size="xs" c="dimmed" mb={6}>
              Skills found in this CV
            </Text>
            {resume.detectedSkills.length > 0 ? (
              <SkillChips skills={resume.detectedSkills} />
            ) : (
              <Text size="sm">No known skills were found.</Text>
            )}
          </Box>
        </Stack>
      )}
    </Paper>
  );
}

// One page for both roles. The recruiter also sees the decision panel and private notes.
export default function ApplicationDetailPage() {
  const { id } = useParams();
  const applicationId = Number(id);
  const { user } = useAuth();
  const isRecruiter = user !== null && user.role === "Recruiter";

  const query = useQuery({
    queryKey: ["application", applicationId],
    queryFn: function () {
      return applicationsApi.get(applicationId);
    }
  });

  const backTo = isRecruiter && query.data ? "/recruiter/jobs/" + query.data.jobId + "/applicants" : isRecruiter ? "/recruiter/jobs" : "/candidate/applications";
  const backLabel = isRecruiter ? "Back to applicants" : "Back to my applications";

  return (
    <>
      <Anchor
        component={Link}
        to={backTo}
        size="sm"
        fw={600}
        mb="md"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <IconArrowLeft size={16} />
        {backLabel}
      </Anchor>

      {query.isPending && (
        <Stack gap="md">
          <Skeleton height={48} width="50%" />
          <Skeleton height={220} radius="lg" />
          <Skeleton height={160} radius="lg" />
        </Stack>
      )}

      {query.isError && <ErrorAlert error={query.error} title="This application could not be found" />}

      {query.isSuccess && (
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
            <Box>
              <Title order={2}>{isRecruiter ? query.data.candidateName : query.data.jobTitle}</Title>
              <Text c="dimmed" mt={4}>
                {isRecruiter
                  ? "Applied for " + query.data.jobTitle + " on " + formatDate(query.data.appliedAt)
                  : query.data.companyName + ", applied on " + formatDate(query.data.appliedAt)}
              </Text>
            </Box>
            <StatusBadge status={query.data.status} size="lg" />
          </Group>

          <Grid gutter="lg">
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                {isRecruiter && <CandidatePanel application={query.data} />}

                <Paper p="lg">
                  <Title order={4} mb="md">
                    Skills this job needs
                  </Title>
                  <SkillChips skills={splitSkills(query.data.jobRequiredSkills)} color="brand" />
                </Paper>

                <ResumePanel application={query.data} />

                <AiAnalysisPanel applicationId={query.data.applicationId} hasResume={query.data.resume !== null} />
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="lg">
                <Paper p="lg">
                  <Title order={4} mb="md">
                    Progress
                  </Title>
                  <ApplicationTimeline status={query.data.status} />
                </Paper>

                {isRecruiter && <StatusUpdatePanel application={query.data} />}

                <InterviewSection
                  applicationId={query.data.applicationId}
                  isRecruiter={isRecruiter}
                  canSchedule={query.data.status === "Shortlisted" || query.data.status === "Interview"}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      )}
    </>
  );
}
