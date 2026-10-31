import { Badge, Box, Container, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface Props {
  badge: string;
  title: string;
  text: string;
  children?: ReactNode;
}

// The big heading at the top of About, Features, Pricing and Contact
export default function PageHero({ badge, title, text, children }: Props) {
  return (
    <Box className="hero" pt={{ base: 56, md: 88 }} pb={{ base: 40, md: 64 }}>
      <Container size="md">
        <Stack align="center" gap="lg" ta="center">
          <Badge size="lg" radius="xl" variant="light">
            {badge}
          </Badge>
          <Title order={1} fz={{ base: 34, md: 52 }} lh={1.08} maw={760}>
            {title}
          </Title>
          <Text size="lg" c="dimmed" maw={620}>
            {text}
          </Text>
          {children}
        </Stack>
      </Container>
    </Box>
  );
}
