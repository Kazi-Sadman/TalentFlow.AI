import { Group, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, description, actions }: Props) {
  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="md" mb="lg">
      <Stack gap={4}>
        <Title order={2}>{title}</Title>
        {description && (
          <Text c="dimmed" size="sm" maw={560}>
            {description}
          </Text>
        )}
      </Stack>
      {actions}
    </Group>
  );
}
