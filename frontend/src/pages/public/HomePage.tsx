import { Anchor, Badge, Box, Button, Container, Grid, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconBriefcase, IconChevronRight, IconSparkles } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { jobsApi } from "../../api/endpoints";
import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/ErrorAlert";
import FeatureCard from "../../components/common/FeatureCard";
import JobListItem from "../../components/common/JobListItem";
import ListSkeleton from "../../components/common/ListSkeleton";
import HeroMock from "../../components/home/HeroMock";
import { MAIN_FEATURES } from "../../content/features";
import { GLASS, LINE } from "../../theme";

const STEPS = [
  { title: "Post a job", text: "Describe the role and list the skills you need. Publish when you are ready." },
  { title: "Candidates apply", text: "People upload a PDF CV and apply in one click. Every application lands in one list." },
  { title: "Read with evidence", text: "Run the skill match, check the CV text behind each skill and move people forward." }
];

const STACK_ITEMS = ["ASP.NET Core", "PostgreSQL", "React", "TypeScript", "JWT security"];

export default function HomePage() {
  const jobsQuery = useQuery({
    queryKey: ["jobs", "latest"],
    queryFn: function () {
      return jobsApi.list({ page: 1, pageSize: 5 });
    }
  });

  return (
    <>
      {/* ---------- Hero ---------- */}
      <Box className="hero" pt={{ base: 40, md: 72 }} pb={{ base: 80, md: 150 }}>
        <Container size="lg">
          <Grid gutter={48} align="center">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Badge size="lg" radius="xl" variant="light" leftSection={<IconSparkles size={14} />} style={{ alignSelf: "flex-start" }}>
                  AI-assisted hiring
                </Badge>

                <Title order={1} fz={{ base: 40, sm: 52, lg: 62 }} lh={1.04} style={{ letterSpacing: "-0.02em" }}>
                  Streamline Your Hiring With Evidence
                </Title>

                <Text size="md" c="dimmed" maw={500} lh={1.7}>
                  Post jobs, collect applications and read every CV with the proof behind each skill. Free to start. You make every decision.
                </Text>

                <Group gap="sm">
                  <Button component={Link} to="/register" size="md">
                    Get Started Free
                  </Button>
                  <Button component={Link} to="/features" size="md" variant="default" rightSection={<IconChevronRight size={16} />}>
                    Learn more
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <HeroMock />
              <Text size="xs" c="dimmed" ta="center" mt="md">
                Sample data for illustration
              </Text>
            </Grid.Col>
          </Grid>
        </Container>
        <div className="hero-floor" />
      </Box>

      {/* ---------- Built on ---------- */}
      <Container size="lg">
        <Stack align="center" gap="lg" py="xl">
          <Text ff="heading" fw={600} fz={22} ta="center">
            Built on a solid, open stack
          </Text>
          <Group justify="center" gap={{ base: "lg", md: 56 }}>
            {STACK_ITEMS.map(function (name) {
              return (
                <Text key={name} ff="heading" fw={600} fz={20} c="dimmed">
                  {name}
                </Text>
              );
            })}
          </Group>
        </Stack>
      </Container>

      {/* ---------- Features ---------- */}
      <Container size="lg" mt={72}>
        <Stack gap="xs" mb="xl" maw={560}>
          <Title order={2} fz={{ base: 30, md: 40 }}>
            Everything you need to hire well
          </Title>
          <Text c="dimmed">One place for jobs, applications, skill matches and interviews. No spreadsheets.</Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {MAIN_FEATURES.map(function (feature) {
            return <FeatureCard key={feature.title} feature={feature} />;
          })}
        </SimpleGrid>

        <Group justify="center" mt="xl">
          <Button component={Link} to="/features" variant="default" rightSection={<IconChevronRight size={16} />}>
            See all features
          </Button>
        </Group>
      </Container>

      {/* ---------- How it works ---------- */}
      <Container size="lg" mt={96}>
        <Title order={2} fz={{ base: 30, md: 40 }} mb="xl">
          How it works
        </Title>
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {STEPS.map(function (step, index) {
            return (
              <Paper key={step.title} p="xl" style={{ borderStyle: "dashed" }}>
                <ThemeIcon size={40} radius="xl" variant="light" mb="md">
                  <Text fw={700}>{index + 1}</Text>
                </ThemeIcon>
                <Title order={4} mb={6}>
                  {step.title}
                </Title>
                <Text size="sm" c="dimmed" lh={1.65}>
                  {step.text}
                </Text>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Container>

      {/* ---------- Open jobs ---------- */}
      <Container size="lg" mt={96}>
        <Group justify="space-between" align="flex-end" mb="lg">
          <Stack gap={4}>
            <Title order={2} fz={{ base: 30, md: 40 }}>
              Open jobs
            </Title>
            <Text c="dimmed">The newest roles on TalentFlow AI.</Text>
          </Stack>
          <Anchor component={Link} to="/jobs" fw={600}>
            See all jobs
          </Anchor>
        </Group>

        {jobsQuery.isPending && <ListSkeleton rows={3} />}
        {jobsQuery.isError && <ErrorAlert error={jobsQuery.error} title="Could not load jobs" />}
        {jobsQuery.isSuccess && jobsQuery.data.items.length === 0 && (
          <Paper>
            <EmptyState
              icon={<IconBriefcase size={24} />}
              title="No open jobs yet"
              text="Companies have not published a job yet. Please check again soon."
            />
          </Paper>
        )}
        {jobsQuery.isSuccess && jobsQuery.data.items.length > 0 && (
          <Stack gap="sm">
            {jobsQuery.data.items.map(function (job) {
              return <JobListItem key={job.id} job={job} />;
            })}
          </Stack>
        )}
      </Container>

      {/* ---------- Call to action ---------- */}
      <Container size="lg" mt={96}>
        <Box
          className="glow-mint"
          p={{ base: "xl", md: 56 }}
          style={{ ...GLASS, borderRadius: 24, border: "1px solid " + LINE, textAlign: "center" }}
        >
          <Stack align="center" gap="md">
            <Title order={2} fz={{ base: 28, md: 40 }} maw={600}>
              Ready to read your next application?
            </Title>
            <Text c="dimmed" maw={480}>
              Create a free account as a recruiter or a candidate. It takes about one minute.
            </Text>
            <Group gap="sm" mt="xs" justify="center">
              <Button component={Link} to="/register" size="md">
                Get Started Free
              </Button>
              <Button component={Link} to="/pricing" size="md" variant="default">
                See pricing
              </Button>
            </Group>
          </Stack>
        </Box>
      </Container>
    </>
  );
}
