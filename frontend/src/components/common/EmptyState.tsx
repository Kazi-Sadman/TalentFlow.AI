import { Center, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface Props {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}

// Shown when a list has no items. It tells the user what to do next.
export default function EmptyState({ icon, title, text, action }: Props) {
  return (
    <Center py={48} px="md">
      <Stack align="center" gap="xs" maw={380}>
        <ThemeIcon size={48} radius="xl" variant="light" color="gray">
          {icon}
        </ThemeIcon>
        <Title order={4} ta="center">
          {title}
        </Title>
        <Text c="dimmed" size="sm" ta="center">
          {text}
        </Text>
        {action}
      </Stack>
    </Center>
  );
}
