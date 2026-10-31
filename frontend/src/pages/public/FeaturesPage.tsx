import { Box, Button, Container, Grid, Group, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import FeatureCard from "../../components/common/FeatureCard";
import PageHero from "../../components/common/PageHero";
import { MAIN_FEATURES } from "../../content/features";

interface DetailBlockProps {
  title: string;
  intro: string;
  points: string[];
}

// A title, one sentence and a list of what the user can do
function DetailBlock({ title, intro, points }: DetailBlockProps) {
  return (
    <Paper p="xl" h="100%">
      <Title order={3} mb="xs">
        {title}
      </Title>
      <Text c="dimmed" mb="lg" lh={1.65}>
        {intro}
      </Text>
      <List
        spacing="sm"
        size="sm"
        icon={
          <ThemeIcon size={20} radius="xl" variant="light">
            <IconCheck size={12} />
          </ThemeIcon>
        }
      >
        {points.map(function (point) {
          return <List.Item key={point}>{point}</List.Item>;
        })}
      </List>
    </Paper>
  );
}

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        badge="Features"
        title="Everything from the job post to the offer"
        text="Tools for recruiters and for candidates, in one place, with a clear record of every step."
      />

      <Container size="lg">
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {MAIN_FEATURES.map(function (feature) {
            return <FeatureCard key={feature.title} feature={feature} />;
          })}
        </SimpleGrid>
      </Container>

      <Container size="lg" mt={96}>
        <Grid gutter="lg">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DetailBlock
              title="For recruiters"
              intro="Run the whole process from one dashboard."
              points={[
                "Create, edit, publish and close jobs. Keep drafts until you are ready.",
                "See every applicant for a job in one list. Search by name and filter by status.",
                "Run the skill match and read the CV text behind each skill.",
                "Move applications from Applied to Offered. Rejecting needs a confirmation.",
                "Keep private notes and private interview feedback.",
                "Watch new applications and the whole pipeline on the dashboard."
              ]}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <DetailBlock
              title="For candidates"
              intro="Apply in one click and always know where you stand."
              points={[
                "Create a profile with your summary, education, experience and skills.",
                "Upload your CV as a PDF and see which skills were found in it.",
                "Apply once per job. You cannot send the same application twice.",
                "Follow each application on a simple timeline.",
                "See your interview time and meeting link on your own page.",
                "Your private data is never shown to other candidates."
              ]}
            />
          </Grid.Col>
        </Grid>
      </Container>

      <Container size="lg" mt={96}>
        <Box>
          <Title order={2} fz={{ base: 28, md: 36 }} mb="xs">
            Security and fairness
          </Title>
          <Text c="dimmed" mb="xl" maw={600}>
            Hiring data is personal. These rules are built into the system, not added later.
          </Text>
        </Box>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {[
            { title: "Roles and ownership", text: "Candidates and recruiters have separate areas. People see only their own data." },
            { title: "Private CV files", text: "CV files are kept in a private folder and can be downloaded only by people who are allowed to." },
            { title: "A record of changes", text: "Every status change is saved, so you can see what changed and when." },
            { title: "No automatic rejection", text: "The skill match only suggests. A person always makes the decision." }
          ].map(function (item) {
            return (
              <Paper key={item.title} p="lg">
                <Text fw={700} mb={6}>
                  {item.title}
                </Text>
                <Text size="sm" c="dimmed" lh={1.65}>
                  {item.text}
                </Text>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Container>

      <Container size="sm" mt={96}>
        <Stack align="center" gap="md" ta="center">
          <Title order={2} fz={{ base: 28, md: 36 }}>
            Try it with a real job
          </Title>
          <Text c="dimmed">It is free to start and takes about a minute.</Text>
          <Group>
            <Button component={Link} to="/register" size="md">
              Get Started Free
            </Button>
            <Button component={Link} to="/pricing" size="md" variant="default">
              See pricing
            </Button>
          </Group>
        </Stack>
      </Container>
    </>
  );
}
