import { Button, Group, Modal, Paper, Stack, Text, Textarea, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getErrorMessage } from "../../api/client";
import { applicationsApi } from "../../api/endpoints";
import type { ApplicationDetail, ApplicationStatus } from "../../types";
import { NEXT_STATUSES, STATUS_LABELS } from "../../utils/constants";

interface Props {
  application: ApplicationDetail;
}

// Recruiter only: move the application to the next step and keep private notes
export default function StatusUpdatePanel({ application }: Props) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(application.recruiterNotes ? application.recruiterNotes : "");
  const [rejectOpen, setRejectOpen] = useState(false);

  useEffect(
    function () {
      setNotes(application.recruiterNotes ? application.recruiterNotes : "");
    },
    [application.recruiterNotes]
  );

  const mutation = useMutation({
    mutationFn: function (status: ApplicationStatus) {
      return applicationsApi.updateStatus(application.applicationId, { status: status, recruiterNotes: notes });
    },
    onSuccess: function (updated) {
      const changed = updated.status !== application.status;
      queryClient.setQueryData(["application", application.applicationId], updated);
      queryClient.invalidateQueries({ queryKey: ["applicants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      notifications.show({
        color: "teal",
        title: changed ? "Status updated" : "Notes saved",
        message: changed ? "The application is now: " + STATUS_LABELS[updated.status] + "." : "Your private notes were saved."
      });
      setRejectOpen(false);
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not update", message: getErrorMessage(error) });
    }
  });

  const nextOptions = NEXT_STATUSES[application.status];
  const forwardOptions = nextOptions.filter(function (status) {
    return status !== "Rejected";
  });
  const canReject = nextOptions.indexOf("Rejected") >= 0;

  return (
    <Paper p="lg">
      <Title order={4} mb="md">
        Decision
      </Title>

      <Stack gap="sm">
        {nextOptions.length === 0 && (
          <Text size="sm" c="dimmed">
            This application is at its final step ({STATUS_LABELS[application.status]}). The status cannot change any more.
          </Text>
        )}

        {forwardOptions.map(function (status) {
          return (
            <Button
              key={status}
              fullWidth
              loading={mutation.isPending && mutation.variables === status}
              disabled={mutation.isPending}
              onClick={function () {
                mutation.mutate(status);
              }}
            >
              Move to {STATUS_LABELS[status]}
            </Button>
          );
        })}

        {canReject && (
          <Button
            fullWidth
            color="red"
            variant="light"
            disabled={mutation.isPending}
            onClick={function () {
              setRejectOpen(true);
            }}
          >
            Reject application
          </Button>
        )}

        <Textarea
          label="Private notes"
          description="Only recruiters can see these notes."
          autosize
          minRows={3}
          maxLength={2000}
          value={notes}
          onChange={function (e) {
            setNotes(e.currentTarget.value);
          }}
          mt="xs"
        />
        <Button
          variant="default"
          loading={mutation.isPending && mutation.variables === application.status}
          disabled={mutation.isPending}
          onClick={function () {
            mutation.mutate(application.status);
          }}
        >
          Save notes
        </Button>
      </Stack>

      <Modal
        opened={rejectOpen}
        onClose={function () {
          setRejectOpen(false);
        }}
        title="Reject this application?"
        centered
      >
        <Text size="sm">
          {application.candidateName} will see the status “Rejected”. A rejected application cannot be moved forward again.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button
            variant="default"
            onClick={function () {
              setRejectOpen(false);
            }}
          >
            Keep reviewing
          </Button>
          <Button
            color="red"
            loading={mutation.isPending}
            onClick={function () {
              mutation.mutate("Rejected");
            }}
          >
            Reject application
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}
