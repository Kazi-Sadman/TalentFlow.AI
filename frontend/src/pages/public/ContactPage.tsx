import { Anchor, Box, Button, Container, Grid, Paper, Select, Stack, Text, Textarea, TextInput, ThemeIcon, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconMail, IconMessageCircle } from "@tabler/icons-react";
import PageHero from "../../components/common/PageHero";
import { CONTACT_EMAIL } from "../../config";

interface ContactValues {
  name: string;
  email: string;
  topic: string;
  message: string;
}

const TOPICS = ["I want to hire with TalentFlow AI", "I need help with my account", "I have a question about my data", "Something else"];

export default function ContactPage() {
  const form = useForm<ContactValues>({
    initialValues: { name: "", email: "", topic: TOPICS[0], message: "" },
    validate: {
      name: function (value) {
        return value.trim().length > 1 ? null : "Enter your name.";
      },
      email: function (value) {
        return /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address.";
      },
      message: function (value) {
        return value.trim().length >= 10 ? null : "Write at least 10 characters.";
      }
    }
  });

  // There is no server for this form. It opens the visitor's email app with the message filled in.
  function handleSubmit(values: ContactValues) {
    const subject = encodeURIComponent(values.topic);
    const body = encodeURIComponent(values.message + "\n\n" + values.name + "\n" + values.email);
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    notifications.show({ color: "teal", title: "Opening your email app", message: "Press send in your email app to finish." });
  }

  return (
    <>
      <PageHero badge="Contact" title="Talk to us" text="Questions about hiring, your account or your data? Send us a message." />

      <Container size="lg">
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="lg">
              <Paper p="lg">
                <ThemeIcon size={42} radius="md" variant="light" mb="md">
                  <IconMail size={22} />
                </ThemeIcon>
                <Text fw={700}>Email</Text>
                <Anchor href={"mailto:" + CONTACT_EMAIL} size="sm" className="break-anywhere">
                  {CONTACT_EMAIL}
                </Anchor>
              </Paper>

              <Paper p="lg">
                <ThemeIcon size={42} radius="md" variant="light" mb="md">
                  <IconMessageCircle size={22} />
                </ThemeIcon>
                <Text fw={700}>What to include</Text>
                <Text size="sm" c="dimmed" mt={4} lh={1.65}>
                  Tell us who you are and what you need. Please do not send passwords or CV files by email.
                </Text>
              </Paper>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 7 }}>
            <Paper p="xl">
              <Title order={3} mb="lg">
                Send a message
              </Title>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="md">
                  <TextInput label="Your name" autoComplete="name" {...form.getInputProps("name")} />
                  <TextInput label="Your email" autoComplete="email" {...form.getInputProps("email")} />
                  <Select label="Topic" data={TOPICS} allowDeselect={false} {...form.getInputProps("topic")} />
                  <Textarea label="Message" autosize minRows={5} maxLength={2000} {...form.getInputProps("message")} />
                  <Box>
                    <Button type="submit">Send message</Button>
                    <Text size="xs" c="dimmed" mt="xs">
                      This opens your email app with the message ready to send.
                    </Text>
                  </Box>
                </Stack>
              </form>
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}
