import { Alert, Anchor, Button, Group, PasswordInput, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import AuthShell from "../../components/layout/AuthShell";
import { useAuth } from "../../context/AuthContext";
import { firstName, homePathFor } from "../../utils/format";

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<LoginValues>({
    initialValues: { email: "", password: "" },
    validate: {
      email: function (value) {
        return /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address.";
      },
      password: function (value) {
        return value.length > 0 ? null : "Enter your password.";
      }
    }
  });

  // Already signed in? Go to the workspace.
  if (user !== null) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  const state = location.state as { from?: string } | null;
  const from = state && state.from ? state.from : null;

  async function handleSubmit(values: LoginValues) {
    setLoading(true);
    setErrorMessage("");
    try {
      const signedIn = await login(values.email.trim(), values.password);
      notifications.show({ color: "teal", title: "Signed in", message: "Welcome back, " + firstName(signedIn.fullName) + "." });
      navigate(from ? from : homePathFor(signedIn.role), { replace: true });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use the account you created on TalentFlow AI."
      footer={
        <Text size="sm" c="dimmed">
          New here?{" "}
          <Anchor component={Link} to="/register" fw={600}>
            Create an account
          </Anchor>
        </Text>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {errorMessage !== "" && (
            <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />}>
              {errorMessage}
            </Alert>
          )}
          <TextInput label="Email" placeholder="you@example.com" autoComplete="email" {...form.getInputProps("email")} />
          <PasswordInput label="Password" autoComplete="current-password" {...form.getInputProps("password")} />
          <Button type="submit" size="md" loading={loading} fullWidth>
            Sign in
          </Button>
        </Stack>
      </form>

      <Stack gap={6} mt="xl" p="md" style={{ background: "#18211D", borderRadius: 8, border: "1px solid #232D29" }}>
        <Text size="sm" fw={600}>
          Trying the demo?
        </Text>
        <Text size="xs" c="dimmed">
          These accounts exist when the backend runs in Development with demo data.
        </Text>
        <Group gap="xs">
          <Button
            size="xs"
            variant="default"
            onClick={function () {
              form.setValues({ email: "recruiter@demo.com", password: "Demo@12345" });
            }}
          >
            Fill recruiter demo
          </Button>
          <Button
            size="xs"
            variant="default"
            onClick={function () {
              form.setValues({ email: "candidate@demo.com", password: "Demo@12345" });
            }}
          >
            Fill candidate demo
          </Button>
        </Group>
      </Stack>
    </AuthShell>
  );
}
