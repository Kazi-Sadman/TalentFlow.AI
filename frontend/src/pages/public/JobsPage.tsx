import { Button, Container, Group, Paper, Select, Stack, Text, TextInput } from "@mantine/core";
import type { ComboboxItem } from "@mantine/core";
import { IconBriefcase, IconSearch } from "@tabler/icons-react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { FormEvent } from "react";
import { jobsApi } from "../../api/endpoints";
import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/ErrorAlert";
import JobListItem from "../../components/common/JobListItem";
import ListSkeleton from "../../components/common/ListSkeleton";
import PageHeader from "../../components/common/PageHeader";
import PagerFooter from "../../components/common/PagerFooter";
import { EXPERIENCE_LEVELS } from "../../utils/constants";

interface Filters {
  search: string;
  skill: string;
  level: string;
}

const EMPTY_FILTERS: Filters = { search: "", skill: "", level: "" };
const PAGE_SIZE = 8;

export default function JobsPage() {
  // "form" is what the user is typing. "applied" is what we search for.
  const [form, setForm] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const jobsQuery = useQuery({
    queryKey: ["jobs", applied, page],
    queryFn: function () {
      return jobsApi.list({
        page: page,
        pageSize: PAGE_SIZE,
        search: applied.search,
        skill: applied.skill,
        experienceLevel: applied.level
      });
    },
    placeholderData: keepPreviousData
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setApplied(form);
    setPage(1);
  }

  function handleClear() {
    setForm(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setPage(1);
  }

  const levelOptions: ComboboxItem[] = EXPERIENCE_LEVELS.map(function (level) {
    return { value: level, label: level };
  });

  const hasFilters = applied.search !== "" || applied.skill !== "" || applied.level !== "";

  return (
    <Container size="lg" py="xl">
      <PageHeader title="Find your next job" description="Search by job title, skill or experience level." />

      <Paper p="md" mb="lg">
        <form onSubmit={handleSubmit}>
          <Group align="flex-end" gap="sm" wrap="wrap">
            <TextInput
              label="Job title"
              placeholder="For example: backend"
              leftSection={<IconSearch size={16} />}
              value={form.search}
              onChange={function (e) {
                setForm({ ...form, search: e.currentTarget.value });
              }}
              style={{ flex: "1 1 220px" }}
            />
            <TextInput
              label="Skill"
              placeholder="For example: C#"
              value={form.skill}
              onChange={function (e) {
                setForm({ ...form, skill: e.currentTarget.value });
              }}
              style={{ flex: "1 1 160px" }}
            />
            <Select
              label="Experience level"
              placeholder="Any level"
              data={levelOptions}
              value={form.level === "" ? null : form.level}
              onChange={function (value) {
                setForm({ ...form, level: value ? value : "" });
              }}
              clearable
              style={{ flex: "1 1 160px" }}
            />
            <Group gap="xs">
              <Button type="submit">Search</Button>
              {hasFilters && (
                <Button variant="subtle" color="gray" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </Group>
          </Group>
        </form>
      </Paper>

      {jobsQuery.isPending && <ListSkeleton rows={4} />}
      {jobsQuery.isError && <ErrorAlert error={jobsQuery.error} title="Could not load jobs" />}

      {jobsQuery.isSuccess && jobsQuery.data.items.length === 0 && (
        <Paper>
          <EmptyState
            icon={<IconBriefcase size={24} />}
            title="No jobs match your search"
            text="Try a shorter title, another skill or remove the experience level."
            action={
              <Button variant="light" onClick={handleClear}>
                Clear search
              </Button>
            }
          />
        </Paper>
      )}

      {jobsQuery.isSuccess && jobsQuery.data.items.length > 0 && (
        <>
          <Stack gap="sm">
            {jobsQuery.data.items.map(function (job) {
              return <JobListItem key={job.id} job={job} />;
            })}
          </Stack>
          <PagerFooter
            page={jobsQuery.data.page}
            totalPages={jobsQuery.data.totalPages}
            totalCount={jobsQuery.data.totalCount}
            noun={jobsQuery.data.totalCount === 1 ? "job" : "jobs"}
            onChange={setPage}
          />
        </>
      )}

      {jobsQuery.isSuccess && jobsQuery.isPlaceholderData && (
        <Text size="xs" c="dimmed" mt="xs">
          Updating results...
        </Text>
      )}
    </Container>
  );
}
