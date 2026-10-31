import { Avatar, Box, Group, Paper, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle, IconArrowUpRight, IconCheck, IconSparkles, IconX } from "@tabler/icons-react";
import { GLASS } from "../../theme";

// Sample people. They are only used to draw the picture in the hero.
const SAMPLE_PEOPLE = [
  { initials: "AR", color: "teal" },
  { initials: "MK", color: "cyan" },
  { initials: "SJ", color: "violet" },
  { initials: "LT", color: "orange" }
];

function SampleAvatars({ size }: { size: number }) {
  return (
    <Avatar.Group spacing="sm">
      {SAMPLE_PEOPLE.map(function (person) {
        return (
          <Avatar key={person.initials} size={size} radius="xl" color={person.color} style={{ border: "2px solid #47DC9A" }}>
            {person.initials}
          </Avatar>
        );
      })}
    </Avatar.Group>
  );
}

interface SkillRowProps {
  skill: string;
  state: "match" | "review" | "missing";
  label: string;
}

function SkillRow({ skill, state, label }: SkillRowProps) {
  let color = "teal";
  let icon = <IconCheck size={13} />;
  if (state === "review") {
    color = "yellow";
    icon = <IconAlertTriangle size={13} />;
  }
  if (state === "missing") {
    color = "red";
    icon = <IconX size={13} />;
  }

  return (
    <Group gap="sm" wrap="nowrap" justify="space-between">
      <Group gap="sm" wrap="nowrap">
        <ThemeIcon size={22} radius="xl" color={color} variant="light">
          {icon}
        </ThemeIcon>
        <Text size="sm" fw={600}>
          {skill}
        </Text>
      </Group>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
    </Group>
  );
}

// A collage of floating "glass" cards that shows what the product looks like
export default function HeroMock() {
  const stackOnSmall = { base: "static", md: "absolute" } as const;

  return (
    <Box pos="relative" h={{ base: "auto", md: 480 }} style={{ display: "flex", flexDirection: "column", gap: 16 }} aria-hidden="true">
      {/* 1. Candidates (top right) */}
      <Paper
        className="float-a"
        pos={stackOnSmall}
        top={{ md: 0 }}
        right={{ md: 0 }}
        p="sm"
        radius="lg"
        style={{ ...GLASS, zIndex: 3, alignSelf: "flex-start" }}
      >
        <SampleAvatars size={34} />
      </Paper>

      {/* 2. Pipeline panel (center) */}
      <Paper
        pos={stackOnSmall}
        top={{ md: 64 }}
        left={{ md: 8 }}
        w={{ base: "100%", md: 430 }}
        p="lg"
        radius="lg"
        style={{ ...GLASS, zIndex: 1 }}
      >
        <Group justify="space-between" mb="md">
          <Text ff="heading" fw={700} fz={22} c="white">
            Pipeline
          </Text>
          <Group gap="md">
            <Text size="xs" fw={600} c="brand.5">
              New
            </Text>
            <Text size="xs" c="dimmed">
              In review
            </Text>
            <Text size="xs" c="dimmed">
              Offered
            </Text>
          </Group>
        </Group>

        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box p="md" w={190} style={{ background: "#E8FFF4", borderRadius: 14 }}>
            <Text size="xs" fw={700} c="#2B4A3D">
              New applications
            </Text>
            <Box my={8}>
              <SampleAvatars size={26} />
            </Box>
            <Text ff="heading" fw={700} fz={30} c="#07130E" lh={1}>
              128
            </Text>
          </Box>

          <Box pt="xs" pr="xs">
            <Text size="xs" c="dimmed">
              Last 7 days
            </Text>
            <Group gap={4} mt={4}>
              <IconArrowUpRight size={16} color="#47DC9A" />
              <Text fw={700} c="white">
                12%
              </Text>
            </Group>
            <svg width="96" height="34" viewBox="0 0 96 34" style={{ marginTop: 8 }}>
              <polyline
                points="2,28 16,22 30,25 44,14 58,18 72,8 94,4"
                fill="none"
                stroke="#47DC9A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Group>
      </Paper>

      {/* 3. Mint card (bottom left) */}
      <Paper
        className="float-a glow-mint"
        pos={stackOnSmall}
        bottom={{ md: 14 }}
        left={{ md: 0 }}
        w={{ base: "100%", md: 230 }}
        p="md"
        radius="lg"
        style={{ background: "#47DC9A", border: "none", zIndex: 3 }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Box>
            <Text size="xs" fw={700} c="#0A2A1C">
              Skills matched
            </Text>
            <Text ff="heading" fw={700} fz={36} c="#07130E" lh={1.1}>
              94%
            </Text>
          </Box>
          <ThemeIcon size={44} radius="xl" color="dark" variant="filled">
            <IconSparkles size={22} />
          </ThemeIcon>
        </Group>
        <Text size="xs" c="#0A2A1C" mt={6}>
          Sample result for one job
        </Text>
      </Paper>

      {/* 4. Skill match card (bottom right) */}
      <Paper
        className="float-b"
        pos={stackOnSmall}
        bottom={{ md: 0 }}
        right={{ md: 0 }}
        w={{ base: "100%", md: 270 }}
        p="md"
        radius="lg"
        style={{ ...GLASS, zIndex: 2 }}
      >
        <Group justify="space-between" mb="sm">
          <Text fw={700} c="white">
            Skill match
          </Text>
          <Text size="xs" c="dimmed">
            Suggestion only
          </Text>
        </Group>
        <Box style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SkillRow skill="C#" state="match" label="Matched" />
          <SkillRow skill="PostgreSQL" state="match" label="Matched" />
          <SkillRow skill="EF Core" state="review" label="Please check" />
          <SkillRow skill="Docker" state="missing" label="Not found" />
        </Box>
      </Paper>
    </Box>
  );
}
