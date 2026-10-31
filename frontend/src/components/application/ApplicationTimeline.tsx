import { Alert, Text, Timeline } from "@mantine/core";
import { IconCheck, IconX } from "@tabler/icons-react";
import type { ApplicationStatus } from "../../types";
import { PIPELINE_STEPS, STATUS_LABELS, STEP_DESCRIPTIONS } from "../../utils/constants";

interface Props {
  status: ApplicationStatus;
}

// The steps of an application. This is a real sequence, so a timeline fits.
export default function ApplicationTimeline({ status }: Props) {
  const isRejected = status === "Rejected";
  const activeIndex = isRejected ? -1 : PIPELINE_STEPS.indexOf(status);

  return (
    <>
      <Timeline active={activeIndex} bulletSize={24} lineWidth={2} color="brand">
        {PIPELINE_STEPS.map(function (step, index) {
          return (
            <Timeline.Item
              key={step}
              title={STATUS_LABELS[step]}
              bullet={index <= activeIndex ? <IconCheck size={14} /> : undefined}
            >
              <Text c="dimmed" size="xs">
                {STEP_DESCRIPTIONS[step]}
              </Text>
            </Timeline.Item>
          );
        })}
      </Timeline>

      {isRejected && (
        <Alert color="red" variant="light" icon={<IconX size={18} />} mt="md" title="Rejected">
          This application will not move forward.
        </Alert>
      )}
    </>
  );
}
