import { Button, Group, Menu, Modal, Paper, Stack, Table, Tabs, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBriefcase, IconDotsVertical, IconLock, IconPencil, IconPlus, IconRocket, IconSearch, IconTrash } from "@tabler/icons-react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { jobsApi } from "../../api/endpoints";
import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/ErrorAlert";
import ListSkeleton from "../../components/common/ListSkeleton";
import PageHeader from "../../components/common/PageHeader";
import PagerFooter from "../../components/common/PagerFooter";
import StatusBadge from "../../components/common/StatusBadge";
import type { Job, JobStatus } from "../../types";
import { formatDate } from "../../utils/format";

const PAGE_SIZE = 10;

export default function RecruiterJobsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 350);
  const [page, setPage] = useState(1);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const jobsQuery = useQuery({
    queryKey: ["jobs", "mine", tab, debouncedSearch, page],
    queryFn: function () {
      return jobsApi.mine({
        page: page,
        pageSize: PAGE_SIZE,
        search: debouncedSearch,
        status: tab === "all" ? undefined : tab
      });
    },
    placeholderData: keepPreviousData
  });

  function refreshLists() {
    queryClient.invalidateQueries({ queryKey: ["jobs"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  const statusMutation = useMutation({
    mutationFn: function (input: { id: number; status: JobStatus }) {
      return jobsApi.update(input.id, { status: input.status });
    },
    onSuccess: function (job) {
      notifications.show({
        color: "teal",
        title: job.status === "Published" ? "Job published" : "Job closed",
        message: job.title + (job.status === "Published" ? " is now visible to candidates." : " no longer accepts applications.")
      });
      refreshLists();
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not change the job", message: getErrorMessage(error) });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: function (id: number) {
      return jobsApi.remove(id);
    },
    onSuccess: function () {
      notifications.show({ color: "teal", title: "Draft deleted", message: "The draft job was deleted." });
      setJobToDelete(null);
      refreshLists();
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not delete", message: getErrorMessage(error) });
    }
  });

  return (
    <>
      <PageHeader
        title="Jobs and applicants"
        description="Publish jobs, close them when you are done, and open a job to review its applicants."
        actions={
          <Button component={Link} to="/recruiter/jobs/new" leftSection={<IconPlus size={18} />}>
            Post a job
          </Button>
        }
      />

      <Paper>
        <Group justify="space-between" p="md" wrap="wrap" gap="sm">
          <Tabs
            value={tab}
            onChange={function (value) {
              setTab(value ? value : "all");
              setPage(1);
            }}
          >
            <Tabs.List style={{ borderBottom: "none" }}>
              <Tabs.Tab value="all">All</Tabs.Tab>
              <Tabs.Tab value="Draft">Drafts</Tabs.Tab>
              <Tabs.Tab value="Published">Published</Tabs.Tab>
              <Tabs.Tab value="Closed">Closed</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <TextInput
            placeholder="Search by title"
            aria-label="Search by title"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={function (e) {
              setSearch(e.currentTarget.value);
              setPage(1);
            }}
            w={240}
          />
        </Group>

        {jobsQuery.isPending && (
          <Stack p="md">
            <ListSkeleton rows={4} height={48} />
          </Stack>
        )}
        {jobsQuery.isError && (
          <Stack p="md">
            <ErrorAlert error={jobsQuery.error} title="Could not load your jobs" />
          </Stack>
        )}

        {jobsQuery.isSuccess && jobsQuery.data.items.length === 0 && (
          <EmptyState
            icon={<IconBriefcase size={24} />}
            title={tab === "all" && debouncedSearch === "" ? "You have not posted a job yet" : "No jobs found"}
            text={
              tab === "all" && debouncedSearch === ""
                ? "Post your first job to start receiving applications."
                : "Try another tab or a different title."
            }
            action={
              tab === "all" && debouncedSearch === "" ? (
                <Button component={Link} to="/recruiter/jobs/new" mt="xs">
                  Post a job
                </Button>
              ) : undefined
            }
          />
        )}

        {jobsQuery.isSuccess && jobsQuery.data.items.length > 0 && (
          <Table.ScrollContainer minWidth={760}>
            <Table highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Job</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Level</Table.Th>
                  <Table.Th>Deadline</Table.Th>
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
                      <Table.Td>{job.experienceLevel}</Table.Td>
                      <Table.Td>{formatDate(job.deadline)}</Table.Td>
                      <Table.Td>{formatDate(job.createdAt)}</Table.Td>
                      <Table.Td>
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          <Button component={Link} to={"/recruiter/jobs/" + job.id + "/applicants"} size="xs" variant="light">
                            Applicants
                          </Button>
                          <Menu position="bottom-end" width={190} shadow="md">
                            <Menu.Target>
                              <Button variant="default" size="xs" px={8} aria-label={"Actions for " + job.title}>
                                <IconDotsVertical size={16} />
                              </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                              {job.status !== "Closed" && (
                                <Menu.Item component={Link} to={"/recruiter/jobs/" + job.id + "/edit"} leftSection={<IconPencil size={16} />}>
                                  Edit job
                                </Menu.Item>
                              )}
                              {job.status === "Draft" && (
                                <Menu.Item
                                  leftSection={<IconRocket size={16} />}
                                  onClick={function () {
                                    statusMutation.mutate({ id: job.id, status: "Published" });
                                  }}
                                >
                                  Publish job
                                </Menu.Item>
                              )}
                              {job.status !== "Closed" && (
                                <Menu.Item
                                  leftSection={<IconLock size={16} />}
                                  onClick={function () {
                                    statusMutation.mutate({ id: job.id, status: "Closed" });
                                  }}
                                >
                                  Close job
                                </Menu.Item>
                              )}
                              {job.status === "Draft" && (
                                <Menu.Item
                                  color="red"
                                  leftSection={<IconTrash size={16} />}
                                  onClick={function () {
                                    setJobToDelete(job);
                                  }}
                                >
                                  Delete draft
                                </Menu.Item>
                              )}
                              {job.status === "Closed" && (
                                <Text size="xs" c="dimmed" px="sm" py={6}>
                                  Closed jobs cannot be changed.
                                </Text>
                              )}
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {jobsQuery.isSuccess && (
        <PagerFooter
          page={jobsQuery.data.page}
          totalPages={jobsQuery.data.totalPages}
          totalCount={jobsQuery.data.totalCount}
          noun={jobsQuery.data.totalCount === 1 ? "job" : "jobs"}
          onChange={setPage}
        />
      )}

      <Modal
        opened={jobToDelete !== null}
        onClose={function () {
          setJobToDelete(null);
        }}
        title="Delete this draft?"
        centered
      >
        <Text size="sm">
          “{jobToDelete ? jobToDelete.title : ""}” will be deleted for good. Published jobs cannot be deleted, only closed.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button
            variant="default"
            onClick={function () {
              setJobToDelete(null);
            }}
          >
            Keep draft
          </Button>
          <Button
            color="red"
            loading={deleteMutation.isPending}
            onClick={function () {
              if (jobToDelete) {
                deleteMutation.mutate(jobToDelete.id);
              }
            }}
          >
            Delete draft
          </Button>
        </Group>
      </Modal>
    </>
  );
}
