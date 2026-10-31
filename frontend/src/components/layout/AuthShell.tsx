import { Box, Flex, List, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { BG, LINE } from "../../theme";
import Logo from "./Logo";

interface Props {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

// Two-column layout for the sign-in and register pages
export default function AuthShell({ title, subtitle, children, footer }: Props) {
  return (
    <Flex mih="100vh" style={{ background: BG }}>
      <Box
        visibleFrom="md"
        p={48}
        className="hero"
        style={{
          flex: "0 0 44%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid " + LINE
        }}
      >
        <Logo />

        <Stack gap="xl" maw={440}>
          <Title order={1} c="white" fz={40} lh={1.1}>
            Every skill comes with its evidence.
          </Title>
          <List
            spacing="md"
            size="md"
            c="dimmed"
            icon={
              <ThemeIcon size={22} radius="xl" variant="light">
                <IconCheck size={14} />
              </ThemeIcon>
            }
          >
            <List.Item>See where each required skill appears in the CV.</List.Item>
            <List.Item>Move people from Applied to Offered in one list.</List.Item>
            <List.Item>Every status change is recorded.</List.Item>
          </List>
        </Stack>

        <Text size="sm" c="dimmed">
          Matches are suggestions. The recruiter decides.
        </Text>
        <div className="hero-floor" />
      </Box>

      <Flex flex={1} align="center" justify="center" p="lg">
        <Box w="100%" maw={420} py="xl">
          <Box hiddenFrom="md" mb="xl">
            <Logo />
          </Box>
          <Title order={2} mb={6} c="white">
            {title}
          </Title>
          <Text c="dimmed" mb="xl">
            {subtitle}
          </Text>
          {children}
          <Box mt="lg">{footer}</Box>
        </Box>
      </Flex>
    </Flex>
  );
}
