import { Anchor, Box, Button, Group, Paper, SimpleGrid, Skeleton, Stack, Table, Text, Title } from "@mantine/core";
import { IconBriefcase, IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { dashboardApi, jobsApi } from "../../api/endpoints";
import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/ErrorAlert";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { LINE, SURFACE } from "../../theme";
import { PIPELINE_COLORS, STATUS_LABELS } from "../../utils/constants";
import { firstName, formatDate } from "../../utils/format";
import type { DashboardSummary } from "../../types";

interface StatCellProps {
  label: string;
  value: number;
  hint: string;
}

function StatCell({ label, value, hint }: StatCellProps) {
  return (
    <Box bg={SURFACE} p="lg">
      <Text size="sm" c="dimmed">
        {label}
      </Text>
      <Title order={2} fz={34} mt={4}>
        {value}
      </Title>
      <Text size="xs" c="dimmed" mt={2}>
        {hint}
      </Text>
    </Box>
  );
}

// The colored bar that shows how many applications are in each step
function PipelinePanel({ summary }: { summary: DashboardSummary }) {
  const total = summary.pipeline.reduce(function (sum, item) {
    return sum + item.count;
  }, 0);

  return (
    <Paper p="lg">
      <Group justify="space-between" mb="md">
        <Title order={4}>Hiring pipeline</Title>
        <Text size="sm" c="dimmed">
          {total} {total === 1 ? "application" : "applications"} in total
        </Text>
      </Group>

      {total === 0 ? (
        <Text size="sm" c="dimmed">
          No applications yet. When candidates apply, you will see how many are in each step here.
        </Text>
      ) : (
        <>
          <Box style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", background: "#1E2823", gap: 2 }}>
            {summary.pipeline
              .filter(function (item) {
                return item.count > 0;
              })
              .map(function (item) {
                return (
                  <Box
                    key={item.status}
                    title={STATUS_LABELS[item.status] + ": " + item.count}
                    style={{ flex: item.count, background: PIPELINE_COLORS[item.status] }}
                  />
                );
              })}
          </Box>

          <SimpleGrid cols={{ base: 2, sm: 3 }} mt="lg" spacing="md">
            {summary.pipeline.map(function (item) {
              return (
                <Group key={item.status} gap="xs" wrap="nowrap">
                  <Box w={10} h={10} style={{ borderRadius: 3, background: PIPELINE_COLORS[item.status], flexShrink: 0 }} />
                  <Text size="sm">{STATUS_LABELS[item.status]}</Text>
                  <Text size="sm" fw={700}>
                    {item.count}
                  </Text>
                </Group>
              );
            })}
          </SimpleGrid>
        </>
      )}
    </Paper>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ["dashboard"],
    queryFn: function () {
      return dashboardApi.summary();
    }
  });

  const jobsQuery = useQuery({
    queryKey: ["jobs", "mine", "recent"],
    queryFn: function () {
      return jobsApi.mine({ page: 1, pageSize: 5 });
    }
  });

  return (
    <>
      <PageHeader
        title={"Welcome back, " + (user ? firstName(user.fullName) : "")}
        description="Here is what is happening with your jobs and applicants."
        actions={
          <Button component={Link} to="/recruiter/jobs/new" leftSection={<IconPlus size={18} />}>
            Post a job
          </Button>
        }
      />

      <Stack gap="lg">
        {summaryQuery.isPending && <Skeleton height={120} radius="lg" />}
        {summaryQuery.isError && <ErrorAlert error={summaryQuery.error} title="Could not load the overview" />}

        {summaryQuery.isSuccess && (
          <>
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
                gap: 1,
                background: LINE,
                border: "1px solid " + LINE,
                borderRadius: 12,
                overflow: "hidden"
              }}
            >
              <StatCell label="Published jobs" value={summaryQuery.data.publishedJobs} hint={summaryQuery.data.draftJobs + " in draft"} />
              <StatCell label="New applications" value={summaryQuery.data.newApplications} hint="waiting for a first review" />
              <StatCell label="Last 7 days" value={summaryQuery.data.applicationsLast7Days} hint="applications received" />
              <StatCell label="Upcoming interviews" value={summaryQuery.data.upcomingInterviews} hint="already scheduled" />
            </Box>

            <PipelinePanel summary={summaryQuery.data} />
          </>
        )}

        <Paper>
          <Group justify="space-between" p="lg" pb="sm">
            <Title order={4}>Your latest jobs</Title>
            <Anchor component={Link} to="/recruiter/jobs" size="sm" fw={600}>
              See all jobs
            </Anchor>
          </Group>

          {jobsQuery.isPending && <Skeleton height={160} m="lg" />}
          {jobsQuery.isError && (
            <Box p="lg">
              <ErrorAlert error={jobsQuery.error} title="Could not load your jobs" />
            </Box>
          )}
          {jobsQuery.isSuccess && jobsQuery.data.items.length === 0 && (
            <EmptyState
              icon={<IconBriefcase size={24} />}
              title="You have not posted a job yet"
              text="Post your first job to start receiving applications."
              action={
                <Button component={Link} to="/recruiter/jobs/new" mt="xs">
                  Post a job
                </Button>
              }
            />
          )}
          {jobsQuery.isSuccess && jobsQuery.data.items.length > 0 && (
            <Table.ScrollContainer minWidth={520}>
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Job</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Created</Table.Th>
                    <Table.Th />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {jobsQuery.data.items.map(function (job) {
                    return (
                      <Table.Tr key={job.id}>
                        <Table.Td fw={600}>{job.title}</Table.Td>
                        <Table.Td>
                          <StatusBadge status={job.status} />
                        </Table.Td>
                        <Table.Td>{formatDate(job.createdAt)}</Table.Td>
                        <Table.Td ta="right">
                          <Button component={Link} to={"/recruiter/jobs/" + job.id + "/applicants"} size="xs" variant="light">
                            Applicants
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Paper>
      </Stack>
    </>
  );
}
