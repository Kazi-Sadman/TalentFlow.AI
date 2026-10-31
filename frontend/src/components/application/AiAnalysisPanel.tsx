import { Alert, Badge, Box, Button, Group, Highlight, Paper, Skeleton, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconCheck, IconInfoCircle, IconSparkles, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage, isNotFound } from "../../api/client";
import { aiApi } from "../../api/endpoints";
import { LINE } from "../../theme";
import type { AiAnalysis } from "../../types";
import { formatDateTime } from "../../utils/format";
import ErrorAlert from "../common/ErrorAlert";
import SkillChips from "../common/SkillChips";

interface Props {
  applicationId: number;
  hasResume: boolean;
}

function SectionTitle({ text, color }: { text: string; color: string }) {
  return (
    <Group gap={8} mb={8}>
      <Box w={8} h={8} style={{ borderRadius: 2, background: color }} />
      <Text size="sm" fw={700}>
        {text}
      </Text>
    </Group>
  );
}

function AnalysisResult({ analysis }: { analysis: AiAnalysis }) {
  if (analysis.status === "Failed") {
    return (
      <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />} title="The skill match failed">
        {analysis.errorMessage ? analysis.errorMessage : "Please try again later."} The application was not changed.
      </Alert>
    );
  }

  if (analysis.status !== "Completed") {
    return (
      <Text size="sm" c="dimmed">
        The skill match is still running. Please check again in a moment.
      </Text>
    );
  }

  return (
    <Stack gap="lg">
      <Box>
        <SectionTitle text={"Found in the CV (" + analysis.evidence.length + ")"} color="#47DC9A" />
        {analysis.evidence.length === 0 ? (
          <Text size="sm" c="dimmed">
            None of the required skills were found.
          </Text>
        ) : (
          <Stack gap="xs">
            {analysis.evidence.map(function (item, index) {
              return (
                <Group key={item.skill + index} gap="sm" align="flex-start" wrap="nowrap" p="sm" style={{ border: "1px solid " + LINE, borderRadius: 8 }}>
                  <ThemeIcon size={22} radius="xl" color="teal" variant="light" mt={2}>
                    <IconCheck size={13} />
                  </ThemeIcon>
                  <Box style={{ minWidth: 0 }}>
                    <Text fw={600} size="sm">
                      {item.skill}
                    </Text>
                    <Highlight
                      highlight={item.skill}
                      highlightStyles={{ background: "rgba(71, 220, 154, 0.22)", color: "#9FF3CC", borderRadius: 3 }}
                      size="sm"
                      c="dimmed"
                      className="break-anywhere"
                    >
                      {"..." + item.snippet + "..."}
                    </Highlight>
                  </Box>
                </Group>
              );
            })}
          </Stack>
        )}
      </Box>

      {analysis.needsReview.length > 0 && (
        <Box>
          <SectionTitle text="Please check" color="#FBBF24" />
          <Stack gap={6}>
            {analysis.needsReview.map(function (text, index) {
              return (
                <Group key={index} gap="sm" wrap="nowrap" align="flex-start">
                  <ThemeIcon size={22} radius="xl" color="yellow" variant="light">
                    <IconAlertTriangle size={13} />
                  </ThemeIcon>
                  <Text size="sm">{text}</Text>
                </Group>
              );
            })}
          </Stack>
        </Box>
      )}

      {analysis.missingSkills.length > 0 && (
        <Box>
          <SectionTitle text={"Not found (" + analysis.missingSkills.length + ")"} color="#F87171" />
          <Group gap={6}>
            {analysis.missingSkills.map(function (skill) {
              return (
                <Badge key={skill} color="red" variant="light" leftSection={<IconX size={11} />}>
                  {skill}
                </Badge>
              );
            })}
          </Group>
        </Box>
      )}

      {analysis.extractedSkills.length > 0 && (
        <Box>
          <SectionTitle text="All known skills in the CV" color="#7F8F88" />
          <SkillChips skills={analysis.extractedSkills} />
        </Box>
      )}

      <Text size="xs" c="dimmed">
        Run on {formatDateTime(analysis.createdAt)} with the rule-based matcher. {analysis.disclaimer}
      </Text>
    </Stack>
  );
}

export default function AiAnalysisPanel({ applicationId, hasResume }: Props) {
  const queryClient = useQueryClient();

  // A 404 means "no analysis yet". That is not an error for the user.
  const analysisQuery = useQuery({
    queryKey: ["analysis", applicationId],
    queryFn: async function (): Promise<AiAnalysis | null> {
      try {
        return await aiApi.latest(applicationId);
      } catch (error) {
        if (isNotFound(error)) {
          return null;
        }
        throw error;
      }
    }
  });

  const runMutation = useMutation({
    mutationFn: function () {
      return aiApi.run(applicationId);
    },
    onSuccess: function (analysis) {
      queryClient.setQueryData(["analysis", applicationId], analysis);
      if (analysis.status === "Completed") {
        notifications.show({ color: "teal", title: "Skill match ready", message: "The result is shown below." });
      }
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not run the skill match", message: getErrorMessage(error) });
    }
  });

  const analysis = analysisQuery.data ? analysisQuery.data : null;

  return (
    <Paper p="lg">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={32} radius="md" variant="light">
            <IconSparkles size={18} />
          </ThemeIcon>
          <Box>
            <Title order={4}>Skill match</Title>
            <Text size="xs" c="dimmed">
              Required skills compared with the CV
            </Text>
          </Box>
        </Group>

        <Button
          size="xs"
          variant="light"
          loading={runMutation.isPending}
          disabled={!hasResume}
          onClick={function () {
            runMutation.mutate();
          }}
        >
          {analysis ? "Run again" : "Run skill match"}
        </Button>
      </Group>

      {!hasResume && (
        <Alert color="gray" variant="light" icon={<IconInfoCircle size={18} />}>
          No CV is attached to this application, so there is nothing to compare.
        </Alert>
      )}

      {hasResume && analysisQuery.isPending && <Skeleton height={120} />}
      {hasResume && analysisQuery.isError && <ErrorAlert error={analysisQuery.error} title="Could not load the skill match" />}

      {hasResume && analysisQuery.isSuccess && analysis === null && (
        <Text size="sm" c="dimmed">
          The skill match has not been run yet. It shows where each required skill appears in the CV. It is a suggestion, not a decision.
        </Text>
      )}

      {hasResume && analysisQuery.isSuccess && analysis !== null && <AnalysisResult analysis={analysis} />}
    </Paper>
  );
}
