import { Anchor, Box, Button, Divider, Paper, Skeleton, Stack, Text, Textarea, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCalendarEvent, IconVideo } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getErrorMessage } from "../../api/client";
import { interviewsApi } from "../../api/endpoints";
import type { Interview } from "../../types";
import { formatDateTime, localInputToIso } from "../../utils/format";
import ErrorAlert from "../common/ErrorAlert";

interface Props {
  applicationId: number;
  isRecruiter: boolean;
  canSchedule: boolean;
}

interface InterviewFormValues {
  start: string;
  end: string;
  link: string;
}

// One interview. Recruiters can also write private feedback.
function InterviewItem({ interview, isRecruiter }: { interview: Interview; isRecruiter: boolean }) {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState(interview.feedback ? interview.feedback : "");

  const feedbackMutation = useMutation({
    mutationFn: function () {
      return interviewsApi.saveFeedback(interview.id, feedback);
    },
    onSuccess: function () {
      notifications.show({ color: "teal", title: "Feedback saved", message: "Only recruiters can see your feedback." });
      queryClient.invalidateQueries({ queryKey: ["interviews", interview.applicationId] });
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not save feedback", message: getErrorMessage(error) });
    }
  });

  return (
    <Box>
      <Text fw={600} size="sm">
        {formatDateTime(interview.startAtUtc)}
      </Text>
      <Text size="xs" c="dimmed">
        Until {formatDateTime(interview.endAtUtc)}. Interviewer: {interview.interviewerName}
      </Text>
      <Anchor
        href={interview.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        size="sm"
        fw={600}
        mt={6}
        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        className="break-anywhere"
      >
        <IconVideo size={16} />
        Join the meeting
      </Anchor>

      {isRecruiter && (
        <Stack gap="xs" mt="sm">
          <Textarea
            label="Private feedback"
            autosize
            minRows={2}
            maxLength={3000}
            value={feedback}
            onChange={function (e) {
              setFeedback(e.currentTarget.value);
            }}
          />
          <Button
            size="xs"
            variant="default"
            loading={feedbackMutation.isPending}
            disabled={feedback.trim().length === 0}
            onClick={function () {
              feedbackMutation.mutate();
            }}
            style={{ alignSelf: "flex-start" }}
          >
            Save feedback
          </Button>
        </Stack>
      )}
    </Box>
  );
}

export default function InterviewSection({ applicationId, isRecruiter, canSchedule }: Props) {
  const queryClient = useQueryClient();

  const interviewsQuery = useQuery({
    queryKey: ["interviews", applicationId],
    queryFn: function () {
      return interviewsApi.list(applicationId);
    }
  });

  const form = useForm<InterviewFormValues>({
    initialValues: { start: "", end: "", link: "" },
    validate: {
      start: function (value) {
        if (value === "") {
          return "Choose the start time.";
        }
        return new Date(value).getTime() > Date.now() ? null : "The start time must be in the future.";
      },
      end: function (value, values) {
        if (value === "") {
          return "Choose the end time.";
        }
        if (values.start !== "" && new Date(value).getTime() <= new Date(values.start).getTime()) {
          return "The end time must be after the start time.";
        }
        return null;
      },
      link: function (value) {
        return /^https?:\/\/\S+$/i.test(value.trim()) ? null : "Enter a link that starts with https://";
      }
    }
  });

  const createMutation = useMutation({
    mutationFn: function (values: InterviewFormValues) {
      return interviewsApi.create(applicationId, {
        startAtUtc: localInputToIso(values.start) as string,
        endAtUtc: localInputToIso(values.end) as string,
        meetingLink: values.link.trim()
      });
    },
    onSuccess: function () {
      notifications.show({ color: "teal", title: "Interview scheduled", message: "The candidate can now see the time and the link." });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["interviews", applicationId] });
      // The status can change to "Interview", so we reload the application too
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not schedule", message: getErrorMessage(error) });
    }
  });

  const interviews = interviewsQuery.data ? interviewsQuery.data : [];

  return (
    <Paper p="lg">
      <Title order={4} mb="md">
        Interviews
      </Title>

      {interviewsQuery.isPending && <Skeleton height={70} />}
      {interviewsQuery.isError && <ErrorAlert error={interviewsQuery.error} title="Could not load interviews" />}

      {interviewsQuery.isSuccess && interviews.length === 0 && (
        <Text size="sm" c="dimmed">
          {isRecruiter
            ? canSchedule
              ? "No interview yet. Schedule one below."
              : "You can schedule an interview when the application is Shortlisted."
            : "No interview is planned yet. You will see the time and link here."}
        </Text>
      )}

      {interviewsQuery.isSuccess && interviews.length > 0 && (
        <Stack gap="md">
          {interviews.map(function (interview, index) {
            return (
              <Box key={interview.id}>
                {index > 0 && <Divider mb="md" />}
                <InterviewItem interview={interview} isRecruiter={isRecruiter} />
              </Box>
            );
          })}
        </Stack>
      )}

      {isRecruiter && canSchedule && (
        <>
          <Divider my="lg" label="Schedule an interview" labelPosition="left" />
          <form
            onSubmit={form.onSubmit(function (values) {
              createMutation.mutate(values);
            })}
          >
            <Stack gap="sm">
              <TextInput type="datetime-local" label="Starts" {...form.getInputProps("start")} />
              <TextInput type="datetime-local" label="Ends" {...form.getInputProps("end")} />
              <TextInput label="Meeting link" placeholder="https://meet.example.com/room" {...form.getInputProps("link")} />
              <Button type="submit" leftSection={<IconCalendarEvent size={16} />} loading={createMutation.isPending}>
                Schedule interview
              </Button>
            </Stack>
          </form>
        </>
      )}
    </Paper>
  );
}
