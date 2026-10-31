import { Accordion, Badge, Box, Button, Container, List, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import PageHero from "../../components/common/PageHero";

interface Plan {
  name: string;
  price: string;
  note: string;
  features: string[];
  button: string;
  to: string;
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    name: "Candidate",
    price: "Free",
    note: "For people who are looking for a job.",
    features: ["Profile with your skills", "Upload up to 5 CVs as PDF", "Apply to any open job", "Follow every application", "See interview time and link"],
    button: "Create a candidate account",
    to: "/register",
    highlighted: false
  },
  {
    name: "Recruiter",
    price: "Free in beta",
    note: "For companies that want to hire.",
    features: [
      "Post and manage jobs",
      "See all applicants in one list",
      "Skill match with CV evidence",
      "Hiring pipeline and status history",
      "Interview scheduling and private feedback",
      "Dashboard with live numbers"
    ],
    button: "Get Started Free",
    to: "/register",
    highlighted: true
  },
  {
    name: "Team",
    price: "Coming soon",
    note: "For bigger hiring teams.",
    features: ["Several recruiters in one company", "Your own skill lists", "Exports and reports", "Priority help"],
    button: "Talk to us",
    to: "/contact",
    highlighted: false
  }
];

const QUESTIONS = [
  {
    q: "Is it really free?",
    a: "Yes. The Candidate and Recruiter plans are free while TalentFlow AI is in beta."
  },
  {
    q: "What does the skill match do?",
    a: "It compares the skills a job needs with the text of a CV and shows where each skill was found. It is a suggestion. It never accepts or rejects anyone."
  },
  {
    q: "Who can see my CV?",
    a: "You can. A recruiter can open your CV only if you used it to apply for a job of their company. The file is kept in a private folder on the server."
  },
  {
    q: "Can I use it for scanned CVs?",
    a: "A scanned picture of a page has no text to read, so no skills are found and the result is marked “please check”. A PDF with real text works best."
  }
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        badge="Pricing"
        title="Free while we are in beta"
        text="Create an account, post a job or apply for one. No card is needed."
      />

      <Container size="lg">
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {PLANS.map(function (plan) {
            return (
              <Paper
                key={plan.name}
                p="xl"
                className={plan.highlighted ? "glow-mint" : undefined}
                style={plan.highlighted ? { borderColor: "#47DC9A" } : undefined}
              >
                <Stack gap="lg" h="100%" justify="space-between">
                  <Box>
                    <Box mih={28} mb="xs">
                      {plan.highlighted && (
                        <Badge variant="filled" size="md">
                          For companies
                        </Badge>
                      )}
                    </Box>
                    <Title order={3}>{plan.name}</Title>
                    <Text ff="heading" fw={700} fz={34} mt="xs" lh={1.1}>
                      {plan.price}
                    </Text>
                    <Text size="sm" c="dimmed" mt={6} mb="lg">
                      {plan.note}
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
                      {plan.features.map(function (feature) {
                        return <List.Item key={feature}>{feature}</List.Item>;
                      })}
                    </List>
                  </Box>

                  <Button component={Link} to={plan.to} fullWidth variant={plan.highlighted ? "filled" : "default"}>
                    {plan.button}
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </SimpleGrid>
      </Container>

      <Container size="sm" mt={96}>
        <Title order={2} fz={{ base: 28, md: 36 }} mb="lg" ta="center">
          Questions
        </Title>
        <Accordion variant="separated" radius="md">
          {QUESTIONS.map(function (item) {
            return (
              <Accordion.Item key={item.q} value={item.q}>
                <Accordion.Control>
                  <Text fw={600}>{item.q}</Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text size="sm" c="dimmed" lh={1.7}>
                    {item.a}
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Container>
    </>
  );
}
