import { Paper, Text, ThemeIcon, Title } from "@mantine/core";
import type { FeatureItem } from "../../content/features";

// One feature: an icon, a short title and one or two sentences
export default function FeatureCard({ feature }: { feature: FeatureItem }) {
  const Icon = feature.icon;

  return (
    <Paper p="xl" h="100%">
      <ThemeIcon size={46} radius="md" variant="light" mb="lg">
        <Icon size={24} />
      </ThemeIcon>
      <Title order={4} mb={8}>
        {feature.title}
      </Title>
      <Text size="sm" c="dimmed" lh={1.65}>
        {feature.text}
      </Text>
    </Paper>
  );
}
