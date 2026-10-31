import { Alert, Anchor, Button, PasswordInput, SegmentedControl, Stack, Text, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../api/client";
import AuthShell from "../../components/layout/AuthShell";
import { useAuth } from "../../context/AuthContext";
import { PASSWORD_HELP } from "../../utils/constants";
import { firstName, homePathFor } from "../../utils/format";

type RegisterRole = "Candidate" | "Recruiter";

interface RegisterValues {
  role: RegisterRole;
  fullName: string;
  email: string;
  password: string;
  companyName: string;
}

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<RegisterValues>({
    initialValues: { role: "Candidate", fullName: "", email: "", password: "", companyName: "" },
    validate: {
      fullName: function (value) {
        return value.trim().length > 1 ? null : "Enter your full name.";
      },
      email: function (value) {
        return /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address.";
      },
      password: function (value) {
        return /^(?=.*[A-Za-z])(?=.*[0-9]).{8,100}$/.test(value) ? null : PASSWORD_HELP;
      },
      companyName: function (value, values) {
        if (values.role === "Recruiter" && value.trim().length === 0) {
          return "Enter your company name.";
        }
        return null;
      }
    }
  });

  if (user !== null) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  async function handleSubmit(values: RegisterValues) {
    setLoading(true);
    setErrorMessage("");
    try {
      const created = await register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
        companyName: values.role === "Recruiter" ? values.companyName.trim() : undefined
      });
      notifications.show({ color: "teal", title: "Account created", message: "Welcome, " + firstName(created.fullName) + "." });
      if (created.role === "Candidate") {
        navigate("/candidate/profile", { replace: true });
      } else {
        navigate("/recruiter", { replace: true });
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Choose what you want to do on TalentFlow AI."
      footer={
        <Text size="sm" c="dimmed">
          Already have an account?{" "}
          <Anchor component={Link} to="/login" fw={600}>
            Sign in
          </Anchor>
        </Text>
      }
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <SegmentedControl
            fullWidth
            value={form.values.role}
            onChange={function (value) {
              form.setFieldValue("role", value as RegisterRole);
            }}
            data={[
              { label: "I am looking for a job", value: "Candidate" },
              { label: "I am hiring", value: "Recruiter" }
            ]}
          />

          {errorMessage !== "" && (
            <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />}>
              {errorMessage}
            </Alert>
          )}

          <TextInput label="Full name" autoComplete="name" {...form.getInputProps("fullName")} />
          <TextInput label="Email" placeholder="you@example.com" autoComplete="email" {...form.getInputProps("email")} />

          {form.values.role === "Recruiter" && (
            <TextInput
              label="Company name"
              description="A new company is created for you."
              {...form.getInputProps("companyName")}
            />
          )}

          <PasswordInput
            label="Password"
            description={PASSWORD_HELP}
            autoComplete="new-password"
            {...form.getInputProps("password")}
          />

          <Button type="submit" size="md" loading={loading} fullWidth>
            Create account
          </Button>
        </Stack>
      </form>
    </AuthShell>
  );
}
