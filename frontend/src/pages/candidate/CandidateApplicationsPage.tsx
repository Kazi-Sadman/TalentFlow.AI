import { Anchor, Button, Group, Paper, Select, Stack, Text } from "@mantine/core";
import type { ComboboxItem } from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { applicationsApi } from "../../api/endpoints";
import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/ErrorAlert";
import ListSkeleton from "../../components/common/ListSkeleton";
import PageHeader from "../../components/common/PageHeader";
import PagerFooter from "../../components/common/PagerFooter";
import StatusBadge from "../../components/common/StatusBadge";
import { PIPELINE_STEPS, STATUS_LABELS } from "../../utils/constants";
import { formatDate } from "../../utils/format";

const PAGE_SIZE = 8;

export default function CandidateApplicationsPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const query = useQuery({
    queryKey: ["my-applications", status, page],
    queryFn: function () {
      return applicationsApi.mine({ page: page, pageSize: PAGE_SIZE, status: status ? status : undefined });
    },
    placeholderData: keepPreviousData
  });

  const statusOptions: ComboboxItem[] = PIPELINE_STEPS.concat(["Rejected"]).map(function (item) {
    return { value: item, label: STATUS_LABELS[item] };
  });

  return (
    <>
      <PageHeader
        title="My applications"
        description="Follow every job you applied for, from Applied to Offered."
        actions={
          <Select
            placeholder="All statuses"
            data={statusOptions}
            value={status}
            onChange={function (value) {
              setStatus(value);
              setPage(1);
            }}
            clearable
            w={190}
            aria-label="Filter by status"
          />
        }
      />

      {query.isPending && <ListSkeleton rows={3} height={76} />}
      {query.isError && <ErrorAlert error={query.error} title="Could not load your applications" />}

      {query.isSuccess && query.data.items.length === 0 && (
        <Paper>
          <EmptyState
            icon={<IconBriefcase size={24} />}
            title={status ? "No applications with this status" : "You have not applied yet"}
            text={status ? "Choose another status to see your other applications." : "Find a job that fits your skills and apply in one click."}
            action={
              status ? undefined : (
                <Button component={Link} to="/jobs" mt="xs">
                  Browse jobs
                </Button>
              )
            }
          />
        </Paper>
      )}

      {query.isSuccess && query.data.items.length > 0 && (
        <>
          <Stack gap="sm">
            {query.data.items.map(function (item) {
              return (
                <Paper key={item.id} p="lg">
                  <Group justify="space-between" wrap="wrap" gap="md">
                    <Stack gap={2}>
                      <Anchor
                        component={Link}
                        to={"/candidate/applications/" + item.id}
                        ff="heading"
                        fw={600}
                        fz={18}
                        c="white"
                        underline="never"
                      >
                        {item.jobTitle}
                      </Anchor>
                      <Text size="sm" c="dimmed">
                        {item.companyName}
                      </Text>
                    </Stack>

                    <Group gap="lg">
                      <Text size="sm" c="dimmed">
                        Applied {formatDate(item.appliedAt)}
                      </Text>
                      <StatusBadge status={item.status} />
                      <Button component={Link} to={"/candidate/applications/" + item.id} variant="light" size="xs">
                        View
                      </Button>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
          <PagerFooter
            page={query.data.page}
            totalPages={query.data.totalPages}
            totalCount={query.data.totalCount}
            noun={query.data.totalCount === 1 ? "application" : "applications"}
            onChange={setPage}
          />
        </>
      )}
    </>
  );
}
