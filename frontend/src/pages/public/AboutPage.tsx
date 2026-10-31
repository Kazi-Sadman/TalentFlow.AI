import { Box, Button, Container, Grid, Group, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck, IconEye, IconLock, IconScale, IconUserCheck } from "@tabler/icons-react";
import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import PageHero from "../../components/common/PageHero";
import { GLASS } from "../../theme";

interface Principle {
  icon: ComponentType<{ size?: number }>;
  title: string;
  text: string;
}

const PRINCIPLES: Principle[] = [
  {
    icon: IconEye,
    title: "Evidence first",
    text: "A match is only useful if you can check it. Every skill we report comes with the part of the CV where it was found."
  },
  {
    icon: IconUserCheck,
    title: "People decide",
    text: "The skill match is a suggestion. It never rejects, ranks or approves anyone. Only a recruiter changes the status of an application."
  },
  {
    icon: IconLock,
    title: "Private by design",
    text: "CV files are stored in a private folder. A candidate sees only their own data, and a recruiter sees only the applications for their own company."
  },
  {
    icon: IconScale,
    title: "Skills, not labels",
    text: "The matcher looks at skills only. It does not use age, gender, religion, a photo or any other personal trait."
  }
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        badge="About us"
        title="We help teams read applications with the evidence in front of them"
        text="TalentFlow AI is a recruitment system built around one simple idea: a hiring decision should be easy to explain."
      />

      {/* Why */}
      <Container size="lg">
        <Grid gutter={48} align="flex-start">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Title order={2} fz={{ base: 28, md: 36 }}>
              Why we built it
            </Title>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="md">
              <Text c="dimmed" lh={1.75}>
                Recruiters read hundreds of CVs. Jobs, CVs, interview times and notes often live in different places, and it is slow to find
                the skills a role needs. It is also hard to remember later why someone was moved forward or rejected.
              </Text>
              <Text c="dimmed" lh={1.75}>
                TalentFlow AI puts the whole process in one place. Candidates apply once. Recruiters see every application in one list, run a skill
                match, read the proof and move people through the pipeline. Every status change is recorded.
              </Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Principles */}
      <Container size="lg" mt={96}>
        <Title order={2} fz={{ base: 28, md: 36 }} mb="xl">
          What we believe
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          {PRINCIPLES.map(function (principle) {
            const Icon = principle.icon;
            return (
              <Paper key={principle.title} p="xl">
                <Group align="flex-start" wrap="nowrap" gap="lg">
                  <ThemeIcon size={46} radius="md" variant="light">
                    <Icon size={24} />
                  </ThemeIcon>
                  <Box>
                    <Title order={4} mb={6}>
                      {principle.title}
                    </Title>
                    <Text size="sm" c="dimmed" lh={1.65}>
                      {principle.text}
                    </Text>
                  </Box>
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Container>

      {/* How the match works */}
      <Container size="lg" mt={96}>
        <Box p={{ base: "xl", md: 48 }} style={{ ...GLASS, borderRadius: 24 }}>
          <Grid gutter={48} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Title order={2} fz={{ base: 28, md: 36 }} mb="md">
                How the skill match works
              </Title>
              <Text c="dimmed" lh={1.75}>
                The matcher is rule-based. It does not send a CV to an outside service. It reads the text of the PDF and looks for each skill the
                job needs. Other names for the same skill count too, for example “Postgres” and “PostgreSQL”.
              </Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <List
                spacing="sm"
                c="dimmed"
                icon={
                  <ThemeIcon size={22} radius="xl" variant="light">
                    <IconCheck size={13} />
                  </ThemeIcon>
                }
              >
                <List.Item>Matched skills show the CV text where they were found.</List.Item>
                <List.Item>Skills that were found under another name are marked “please check”.</List.Item>
                <List.Item>Skills that were not found are listed, never used to reject anyone.</List.Item>
                <List.Item>A scanned picture of a CV cannot be read, so it is marked “please check”.</List.Item>
              </List>
            </Grid.Col>
          </Grid>
        </Box>
      </Container>

      {/* CTA */}
      <Container size="sm" mt={96}>
        <Stack align="center" gap="md" ta="center">
          <Title order={2} fz={{ base: 28, md: 36 }}>
            See it with your own jobs
          </Title>
          <Text c="dimmed">Create a free account and post your first job today.</Text>
          <Group>
            <Button component={Link} to="/register" size="md">
              Get Started Free
            </Button>
            <Button component={Link} to="/contact" size="md" variant="default">
              Contact us
            </Button>
          </Group>
        </Stack>
      </Container>
    </>
  );
}
