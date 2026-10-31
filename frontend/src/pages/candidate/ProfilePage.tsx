import { Button, Group, NumberInput, Paper, Skeleton, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getErrorMessage } from "../../api/client";
import { profileApi } from "../../api/endpoints";
import ErrorAlert from "../../components/common/ErrorAlert";
import PageHeader from "../../components/common/PageHeader";
import SkillChips from "../../components/common/SkillChips";
import { splitSkills } from "../../utils/format";

interface ProfileValues {
  summary: string;
  education: string;
  experienceYears: number | string;
  skills: string;
}

export default function ProfilePage() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: function () {
      return profileApi.get();
    }
  });

  const form = useForm<ProfileValues>({
    initialValues: { summary: "", education: "", experienceYears: 0, skills: "" }
  });

  // Fill the form when the profile arrives from the server
  useEffect(
    function () {
      if (profileQuery.data) {
        form.setValues({
          summary: profileQuery.data.summary ? profileQuery.data.summary : "",
          education: profileQuery.data.education ? profileQuery.data.education : "",
          experienceYears: profileQuery.data.experienceYears,
          skills: profileQuery.data.skills ? profileQuery.data.skills : ""
        });
      }
    },
    [profileQuery.data]
  );

  const saveMutation = useMutation({
    mutationFn: function (values: ProfileValues) {
      return profileApi.update({
        summary: values.summary.trim(),
        education: values.education.trim(),
        experienceYears: Number(values.experienceYears) || 0,
        skills: values.skills.trim()
      });
    },
    onSuccess: function (saved) {
      queryClient.setQueryData(["profile"], saved);
      notifications.show({ color: "teal", title: "Profile saved", message: "Recruiters will see your new details." });
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Could not save", message: getErrorMessage(error) });
    }
  });

  return (
    <>
      <PageHeader
        title="Profile"
        description="Recruiters see this information together with your application."
      />

      {profileQuery.isPending && <Skeleton height={380} radius="lg" />}
      {profileQuery.isError && <ErrorAlert error={profileQuery.error} title="Could not load your profile" />}

      {profileQuery.isSuccess && (
        <Paper p="xl" maw={720}>
          <form
            onSubmit={form.onSubmit(function (values) {
              saveMutation.mutate(values);
            })}
          >
            <Stack gap="md">
              <Group grow align="flex-start">
                <TextInput label="Full name" value={profileQuery.data.fullName} readOnly />
                <TextInput label="Email" value={profileQuery.data.email} readOnly />
              </Group>

              <Textarea
                label="Short summary"
                description="Two or three sentences about you."
                autosize
                minRows={3}
                maxLength={2000}
                {...form.getInputProps("summary")}
              />

              <Group grow align="flex-start">
                <TextInput label="Education" placeholder="For example: BSc in Computer Science" maxLength={1000} {...form.getInputProps("education")} />
                <NumberInput label="Years of experience" min={0} max={60} allowDecimal={false} {...form.getInputProps("experienceYears")} />
              </Group>

              <Stack gap={8}>
                <TextInput
                  label="Skills"
                  description="Separate skills with commas."
                  placeholder="C#, ASP.NET Core, SQL, Git"
                  maxLength={500}
                  {...form.getInputProps("skills")}
                />
                {splitSkills(form.values.skills).length > 0 && <SkillChips skills={splitSkills(form.values.skills)} color="brand" />}
              </Stack>

              <Group justify="space-between" mt="sm">
                <Text size="xs" c="dimmed">
                  Your profile is not used to reject anyone. Recruiters decide.
                </Text>
                <Button type="submit" loading={saveMutation.isPending}>
                  Save profile
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      )}
    </>
  );
}
