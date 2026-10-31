import { Anchor, Box, Button, Group, Paper, Select, Skeleton, Table, Text, TextInput } from "@mantine/core";
import type { ComboboxItem } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconArrowLeft, IconSearch, IconUsers } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { applicationsApi, jobsApi } from "../../api/endpoints";
import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/ErrorAlert";
import ListSkeleton from "../../components/common/ListSkeleton";
import PageHeader from "../../components/common/PageHeader";
import PagerFooter from "../../components/common/PagerFooter";
import StatusBadge from "../../components/common/StatusBadge";
import { PIPELINE_STEPS, STATUS_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/format";

const PAGE_SIZE = 10;

export default function ApplicantsPage() {
  const { id } = useParams();
  const jobId = Number(id);

  const [status, setStatus] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: function () {
      return jobsApi.get(jobId);
    }
  });

  const applicantsQuery = useQuery({
    queryKey: ["applicants", jobId, status, debouncedSearch, page],
    queryFn: function () {
      return applicationsApi.forJob(jobId, {
        page: page,
        pageSize: PAGE_SIZE,
        status: status ? status : undefined,
        search: debouncedSearch
      });
    },
    placeholderData: keepPreviousData
  });

  const statusOptions: ComboboxItem[] = PIPELINE_STEPS.concat(["Rejected"]).map(function (item) {
    return { value: item, label: STATUS_LABELS[item] };
  });

  const noFilters = status === null && debouncedSearch === "";

  return (
    <>
      <Anchor
        component={Link}
        to="/recruiter/jobs"
        size="sm"
        fw={600}
        mb="md"
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
      >
        <IconArrowLeft size={16} />
        Back to jobs
      </Anchor>

      {jobQuery.isPending ? (
        <Skeleton height={56} width="50%" mb="lg" />
      ) : (
        <PageHeader
          title={jobQuery.isSuccess ? "Applicants for " + jobQuery.data.title : "Applicants"}
          description="Open an application to read the CV, run the skill match and change the status."
          actions={
            jobQuery.isSuccess ? (
              <Box>
                <StatusBadge status={jobQuery.data.status} size="lg" />
              </Box>
            ) : undefined
          }
        />
      )}

      <Paper>
        <Group p="md" gap="sm" wrap="wrap">
          <TextInput
            placeholder="Search by candidate name"
            aria-label="Search by candidate name"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={function (e) {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={260}
          />
          <Select
            placeholder="All statuses"
            aria-label="Filter by status"
            data={statusOptions}
            value={status}
            onChange={function (value) {
              setStatus(value);
              setPage(1);
            }}
            clearable
            w={190}
          />
        </Group>

        {applicantsQuery.isPending && (
          <Box p="md">
            <ListSkeleton rows={4} height={48} />
          </Box>
        )}
        {applicantsQuery.isError && (
          <Box p="md">
            <ErrorAlert error={applicantsQuery.error} title="Could not load applicants" />
          </Box>
        )}

        {applicantsQuery.isSuccess && applicantsQuery.data.items.length === 0 && (
          <EmptyState
            icon={<IconUsers size={24} />}
            title={noFilters ? "No applications yet" : "No applicants match your filters"}
            text={
              noFilters
                ? "When a candidate applies for this job, they will appear here."
                : "Try another name or status."
            }
          />
        )}

        {applicantsQuery.isSuccess && applicantsQuery.data.items.length > 0 && (
          <Table.ScrollContainer minWidth={700}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Candidate</Table.Th>
                  <Table.Th>Experience</Table.Th>
                  <Table.Th>Applied</Table.Th>
                  <Table.Th>CV</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {applicantsQuery.data.items.map(function (applicant) {
                  return (
                    <Table.Tr key={applicant.applicationId}>
                      <Table.Td>
                        <Text fw={600} size="sm">
                          {applicant.candidateName}
                        </Text>
                        <Text size="xs" c="dimmed" className="break-anywhere">
                          {applicant.candidateEmail}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {applicant.experienceYears} {applicant.experienceYears === 1 ? "year" : "years"}
                      </Table.Td>
                      <Table.Td>{formatDate(applicant.appliedAt)}</Table.Td>
                      <Table.Td>{applicant.resumeId !== null ? "Attached" : "None"}</Table.Td>
                      <Table.Td>
                        <StatusBadge status={applicant.status} />
                      </Table.Td>
                      <Table.Td ta="right">
                        <Button component={Link} to={"/recruiter/applications/" + applicant.applicationId} size="xs" variant="light">
                          Review
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

      {applicantsQuery.isSuccess && (
        <PagerFooter
          page={applicantsQuery.data.page}
          totalPages={applicantsQuery.data.totalPages}
          totalCount={applicantsQuery.data.totalCount}
          noun={applicantsQuery.data.totalCount === 1 ? "applicant" : "applicants"}
          onChange={setPage}
        />
      )}
    </>
  );
}
