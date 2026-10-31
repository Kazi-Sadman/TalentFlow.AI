import { Alert, Anchor, Badge, Box, Button, Container, Divider, Grid, Group, Paper, Select, Skeleton, Stack, Text, Title } from "@mantine/core";
import type { ComboboxItem } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconBuilding, IconClock, IconInfoCircle } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { jobsApi, resumesApi } from "../../api/endpoints";
import ErrorAlert from "../../components/common/ErrorAlert";
import SkillChips from "../../components/common/SkillChips";
import { useAuth } from "../../context/AuthContext";
import type { Job } from "../../types";
import { formatDate, formatDateTime, isPast, splitSkills } from "../../utils/format";

interface ApplyPanelProps {
  job: Job;
}

// The box on the right side: apply button, or the reason why the user cannot apply
function ApplyPanel({ job }: ApplyPanelProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chosenResume, setChosenResume] = useState<string | null>(null);

  const isCandidate = user !== null && user.role === "Candidate";

  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: function () {
      return resumesApi.mine();
    },
    enabled: isCandidate
  });

  const applyMutation = useMutation({
    mutationFn: function (resumeId: number | null) {
      return jobsApi.apply(job.id, resumeId);
    },
    onSuccess: function (application) {
      notifications.show({ color: "teal", title: "Application sent", message: "You applied for " + job.title + "." });
      navigate("/candidate/applications/" + application.id);
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not apply", message: getErrorMessage(error) });
    }
  });

  const isClosed = job.status === "Closed" || isPast(job.deadline);

  if (isClosed) {
    return (
      <Alert color="gray" variant="light" icon={<IconInfoCircle size={18} />} title="Applications are closed">
        This job is not accepting applications any more.
      </Alert>
    );
  }

  if (user === null) {
    return (
      <Stack gap="sm">
        <Text size="sm" c="dimmed">
          Sign in as a candidate to apply for this job.
        </Text>
        <Button component={Link} to="/login" state={{ from: "/jobs/" + job.id }} fullWidth>
          Sign in to apply
        </Button>
        <Button component={Link} to="/register" variant="default" fullWidth>
          Create a candidate account
        </Button>
      </Stack>
    );
  }

  if (user.role === "Recruiter") {
    if (user.companyId === job.companyId) {
      return (
        <Stack gap="sm">
          <Text size="sm" c="dimmed">
            This is a job of your company.
          </Text>
          <Button component={Link} to={"/recruiter/jobs/" + job.id + "/applicants"} fullWidth>
            See applicants
          </Button>
        </Stack>
      );
    }
    return (
      <Alert color="gray" variant="light" icon={<IconInfoCircle size={18} />}>
        You are signed in as a recruiter. Only candidates can apply for jobs.
      </Alert>
    );
  }

  // Candidate
  const resumes = resumesQuery.data ? resumesQuery.data : [];
  const resumeOptions: ComboboxItem[] = resumes.map(function (resume) {
    return { value: String(resume.id), label: resume.originalFileName };
  });
  const selected = chosenResume !== null ? chosenResume : resumes.length > 0 ? String(resumes[0].id) : null;

  return (
    <Stack gap="sm">
      {resumesQuery.isPending && <Skeleton height={36} />}

      {resumesQuery.isSuccess && resumes.length > 0 && (
        <Select
          label="CV to send"
          data={resumeOptions}
          value={selected}
          onChange={setChosenResume}
          allowDeselect={false}
        />
      )}

      {resumesQuery.isSuccess && resumes.length === 0 && (
        <Alert color="yellow" variant="light" icon={<IconInfoCircle size={18} />}>
          You have no CV yet. You can still apply, but a CV helps the recruiter see your skills.{" "}
          <Anchor component={Link} to="/candidate/resumes" size="sm" fw={600}>
            Upload a CV
          </Anchor>
        </Alert>
      )}

      <Button
        fullWidth
        loading={applyMutation.isPending}
        onClick={function () {
          applyMutation.mutate(selected !== null ? Number(selected) : null);
        }}
      >
        Apply for this job
      </Button>
    </Stack>
  );
}

export default function JobDetailPage() {
  const { id } = useParams();
  const jobId = Number(id);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: function () {
      return jobsApi.get(jobId);
    }
  });

  return (
    <Container size="lg" py="xl">
      <Anchor component={Link} to="/jobs" size="sm" fw={600} mb="lg" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <IconArrowLeft size={16} />
        All jobs
      </Anchor>

      {jobQuery.isPending && (
        <Stack gap="md">
          <Skeleton height={40} width="60%" />
          <Skeleton height={260} radius="lg" />
        </Stack>
      )}

      {jobQuery.isError && <ErrorAlert error={jobQuery.error} title="This job could not be found" />}

      {jobQuery.isSuccess && (
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              <Stack gap="xs">
                <Group gap="xs">
                  <Badge color="brand" variant="light">
                    {jobQuery.data.experienceLevel}
                  </Badge>
                  {jobQuery.data.status !== "Published" && (
                    <Badge color={jobQuery.data.status === "Draft" ? "gray" : "dark"} variant="light">
                      {jobQuery.data.status}
                    </Badge>
                  )}
                </Group>
                <Title order={1} fz={{ base: 28, md: 36 }}>
                  {jobQuery.data.title}
                </Title>
                <Group gap="lg">
                  <Group gap={6}>
                    <IconBuilding size={17} color="#8FA099" />
                    <Text c="dimmed">{jobQuery.data.companyName}</Text>
                  </Group>
                  {jobQuery.data.deadline && (
                    <Group gap={6}>
                      <IconClock size={17} color="#8FA099" />
                      <Text c="dimmed">Apply by {formatDate(jobQuery.data.deadline)}</Text>
                    </Group>
                  )}
                </Group>
              </Stack>

              <Paper p="xl">
                <Title order={4} mb="sm">
                  About the role
                </Title>
                <Text style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }} maw={680}>
                  {jobQuery.data.description}
                </Text>

                <Divider my="xl" />

                <Title order={4} mb="sm">
                  Skills needed
                </Title>
                <SkillChips skills={splitSkills(jobQuery.data.requiredSkills)} color="brand" />
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Box style={{ position: "sticky", top: 88 }}>
              <Paper p="lg">
                <Title order={4} mb="md">
                  Apply
                </Title>
                <ApplyPanel job={jobQuery.data} />
                <Text size="xs" c="dimmed" mt="md">
                  Posted {formatDateTime(jobQuery.data.createdAt)}
                </Text>
              </Paper>
            </Box>
          </Grid.Col>
        </Grid>
      )}
    </Container>
  );
}
