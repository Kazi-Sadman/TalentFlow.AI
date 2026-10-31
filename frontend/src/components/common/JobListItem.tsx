import { Anchor, Badge, Button, Group, Paper, Stack, Text } from "@mantine/core";
import { IconBuilding, IconClock } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import type { Job } from "../../types";
import { formatDate, splitSkills } from "../../utils/format";
import SkillChips from "./SkillChips";

interface Props {
  job: Job;
}

// One job in a list (home page and jobs page)
export default function JobListItem({ job }: Props) {
  return (
    <Paper p="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="lg">
        <Stack gap={10} style={{ minWidth: 0 }}>
          <Anchor component={Link} to={"/jobs/" + job.id} ff="heading" fw={600} fz={19} c="white" underline="never">
            {job.title}
          </Anchor>

          <Group gap="md" wrap="wrap">
            <Group gap={6} wrap="nowrap">
              <IconBuilding size={16} color="#8FA099" />
              <Text size="sm" c="dimmed">
                {job.companyName}
              </Text>
            </Group>
            <Badge color="brand" variant="light">
              {job.experienceLevel}
            </Badge>
            {job.deadline && (
              <Group gap={6} wrap="nowrap">
                <IconClock size={16} color="#8FA099" />
                <Text size="sm" c="dimmed">
                  Apply by {formatDate(job.deadline)}
                </Text>
              </Group>
            )}
          </Group>

          <SkillChips skills={splitSkills(job.requiredSkills)} max={5} />
        </Stack>

        <Button component={Link} to={"/jobs/" + job.id} variant="light" visibleFrom="sm">
          View job
        </Button>
      </Group>
    </Paper>
  );
}
