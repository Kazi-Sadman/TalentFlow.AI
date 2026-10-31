import { Alert, Anchor, Button, Group, Paper, Select, Skeleton, Stack, Text, Textarea, TextInput } from "@mantine/core";
import type { ComboboxItem } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconInfoCircle } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import { jobsApi } from "../../api/endpoints";
import ErrorAlert from "../../components/common/ErrorAlert";
import PageHeader from "../../components/common/PageHeader";
import SkillChips from "../../components/common/SkillChips";
import type { ExperienceLevel, JobStatus } from "../../types";
import { EXPERIENCE_LEVELS } from "../../utils/constants";
import { isoToLocalInput, localInputToIso, splitSkills } from "../../utils/format";

interface JobFormValues {
  title: string;
  experienceLevel: string;
  requiredSkills: string;
  description: string;
  deadline: string;
  status: string;
}

// Create a job, or edit one when the address has a job id
export default function JobFormPage() {
  const { id } = useParams();
  const isEdit = id !== undefined;
  const jobId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const jobQuery = useQuery({
    queryKey: ["job", jobId],
    queryFn: function () {
      return jobsApi.get(jobId);
    },
    enabled: isEdit
  });

  const form = useForm<JobFormValues>({
    initialValues: {
      title: "",
      experienceLevel: "Junior",
      requiredSkills: "",
      description: "",
      deadline: "",
      status: "Draft"
    },
    validate: {
      title: function (value) {
        return value.trim().length >= 3 ? null : "Enter a job title (at least 3 characters).";
      },
      requiredSkills: function (value) {
        return splitSkills(value).length > 0 ? null : "Enter at least one skill, separated by commas.";
      },
      description: function (value) {
        return value.trim().length >= 20 ? null : "Describe the role in at least 20 characters.";
      }
    }
  });

  // The deadline that is saved on the server (empty when there is none)
  const savedDeadline = jobQuery.data ? isoToLocalInput(jobQuery.data.deadline) : "";

  // When editing, fill the form with the saved job
  useEffect(
    function () {
      if (jobQuery.data) {
        form.setValues({
          title: jobQuery.data.title,
          experienceLevel: jobQuery.data.experienceLevel,
          requiredSkills: jobQuery.data.requiredSkills,
          description: jobQuery.data.description,
          deadline: isoToLocalInput(jobQuery.data.deadline),
          status: jobQuery.data.status
        });
      }
    },
    [jobQuery.data]
  );

  const saveMutation = useMutation({
    mutationFn: function (values: JobFormValues) {
      const deadlineChanged = values.deadline !== savedDeadline;
      const deadline = localInputToIso(values.deadline);
      const base = {
        title: values.title.trim(),
        description: values.description.trim(),
        requiredSkills: values.requiredSkills.trim(),
        experienceLevel: values.experienceLevel as ExperienceLevel,
        status: values.status as JobStatus
      };

      if (isEdit) {
        // Do not send an old deadline again, the backend only accepts a future date
        return jobsApi.update(jobId, { ...base, deadline: deadlineChanged && deadline !== null ? deadline : undefined });
      }
      return jobsApi.create({ ...base, deadline: deadline });
    },
    onSuccess: function (job) {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", job.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      notifications.show({
        color: "teal",
        title: isEdit ? "Job saved" : job.status === "Published" ? "Job published" : "Draft saved",
        message: job.title
      });
      navigate("/recruiter/jobs");
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not save the job", message: getErrorMessage(error) });
    }
  });

  const levelOptions: ComboboxItem[] = EXPERIENCE_LEVELS.map(function (level) {
    return { value: level, label: level };
  });

  // Which statuses can the user choose? The backend allows Draft -> Published -> Closed only.
  let statusOptions: ComboboxItem[] = [
    { value: "Draft", label: "Save as draft" },
    { value: "Published", label: "Publish now" }
  ];
  if (isEdit && jobQuery.data) {
    if (jobQuery.data.status === "Draft") {
      statusOptions = [
        { value: "Draft", label: "Draft" },
        { value: "Published", label: "Publish now" },
        { value: "Closed", label: "Close" }
      ];
    } else {
      statusOptions = [
        { value: "Published", label: "Published" },
        { value: "Closed", label: "Close this job" }
      ];
    }
  }

  const isClosed = isEdit && jobQuery.data !== undefined && jobQuery.data.status === "Closed";

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

      <PageHeader
        title={isEdit ? "Edit job" : "Post a job"}
        description="Clear skills help the matcher find the right evidence in each CV."
      />

      {isEdit && jobQuery.isPending && <Skeleton height={420} radius="lg" />}
      {isEdit && jobQuery.isError && <ErrorAlert error={jobQuery.error} title="Could not load this job" />}

      {isClosed && (
        <Alert color="gray" variant="light" icon={<IconInfoCircle size={18} />} title="This job is closed">
          A closed job cannot be edited or opened again.
        </Alert>
      )}

      {(!isEdit || (jobQuery.isSuccess && !isClosed)) && (
        <Paper p="xl" maw={760}>
          <form
            onSubmit={form.onSubmit(function (values) {
              const deadlineChanged = values.deadline !== savedDeadline;
              if (values.deadline !== "" && deadlineChanged && new Date(values.deadline).getTime() <= Date.now()) {
                form.setFieldError("deadline", "The deadline must be in the future.");
                return;
              }
              saveMutation.mutate(values);
            })}
          >
            <Stack gap="md">
              <TextInput label="Job title" placeholder="For example: .NET Backend Developer" maxLength={150} {...form.getInputProps("title")} />

              <Group grow align="flex-start">
                <Select label="Experience level" data={levelOptions} allowDeselect={false} {...form.getInputProps("experienceLevel")} />
                <Select label="Status" data={statusOptions} allowDeselect={false} {...form.getInputProps("status")} />
              </Group>

              <Stack gap={8}>
                <TextInput
                  label="Skills needed"
                  description="Separate skills with commas."
                  placeholder="C#, ASP.NET Core, PostgreSQL, Git"
                  maxLength={500}
                  {...form.getInputProps("requiredSkills")}
                />
                {splitSkills(form.values.requiredSkills).length > 0 && (
                  <SkillChips skills={splitSkills(form.values.requiredSkills)} color="brand" />
                )}
              </Stack>

              <Textarea
                label="Description"
                placeholder="What will the person do? What will they learn?"
                autosize
                minRows={6}
                maxLength={5000}
                {...form.getInputProps("description")}
              />

              <TextInput
                type="datetime-local"
                label="Application deadline"
                description="Optional. After this time, candidates cannot apply."
                {...form.getInputProps("deadline")}
              />

              <Group justify="space-between" mt="sm">
                <Text size="xs" c="dimmed">
                  Only published jobs are visible to candidates.
                </Text>
                <Group gap="sm">
                  <Button component={Link} to="/recruiter/jobs" variant="default">
                    Cancel
                  </Button>
                  <Button type="submit" loading={saveMutation.isPending}>
                    {isEdit ? "Save changes" : "Save job"}
                  </Button>
                </Group>
              </Group>
            </Stack>
          </form>
        </Paper>
      )}
    </>
  );
}
