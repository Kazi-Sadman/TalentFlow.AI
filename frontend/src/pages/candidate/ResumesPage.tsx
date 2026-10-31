import { Alert, Button, Group, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import type { FileRejection } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconDownload, IconFileText, IconInfoCircle, IconUpload, IconX } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getErrorMessage } from "../../api/client";
import { resumesApi } from "../../api/endpoints";
import EmptyState from "../../components/common/EmptyState";
import ErrorAlert from "../../components/common/ErrorAlert";
import ListSkeleton from "../../components/common/ListSkeleton";
import PageHeader from "../../components/common/PageHeader";
import SkillChips from "../../components/common/SkillChips";
import { SURFACE } from "../../theme";
import type { ResumeInfo } from "../../types";
import { formatBytes, formatDate } from "../../utils/format";

const MAX_SIZE = 5 * 1024 * 1024;

function ResumeRow({ resume }: { resume: ResumeInfo }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await resumesApi.download(resume.id, resume.originalFileName);
    } catch (error) {
      notifications.show({ color: "red", title: "Could not download", message: getErrorMessage(error) });
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Paper p="lg">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Group gap="md" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
          <ThemeIcon size={40} radius="md" variant="light" color="red">
            <IconFileText size={22} />
          </ThemeIcon>
          <Stack gap={6} style={{ minWidth: 0 }}>
            <Text fw={600} className="break-anywhere">
              {resume.originalFileName}
            </Text>
            <Text size="sm" c="dimmed">
              {formatBytes(resume.sizeBytes)}, uploaded {formatDate(resume.uploadedAt)}
            </Text>
            {resume.detectedSkills.length > 0 ? (
              <Stack gap={6} mt={4}>
                <Text size="xs" fw={600} c="dimmed">
                  Skills found in this CV
                </Text>
                <SkillChips skills={resume.detectedSkills} max={10} />
              </Stack>
            ) : (
              <Text size="sm" c="dimmed" mt={4}>
                No known skills were found in this CV.
              </Text>
            )}
          </Stack>
        </Group>

        <Button variant="default" size="xs" leftSection={<IconDownload size={15} />} loading={downloading} onClick={handleDownload}>
          Download
        </Button>
      </Group>
    </Paper>
  );
}

export default function ResumesPage() {
  const queryClient = useQueryClient();

  const resumesQuery = useQuery({
    queryKey: ["resumes"],
    queryFn: function () {
      return resumesApi.mine();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: function (file: File) {
      return resumesApi.upload(file);
    },
    onSuccess: function () {
      notifications.show({ color: "teal", title: "CV uploaded", message: "Your CV was saved and read successfully." });
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
    onError: function (error) {
      notifications.show({ color: "red", title: "Upload failed", message: getErrorMessage(error) });
    }
  });

  function handleDrop(files: File[]) {
    if (files.length > 0) {
      uploadMutation.mutate(files[0]);
    }
  }

  function handleReject(rejections: FileRejection[]) {
    let message = "Choose a PDF file that is not larger than 5 MB.";
    if (rejections.length > 0 && rejections[0].errors.length > 0) {
      const code = rejections[0].errors[0].code;
      if (code === "file-too-large") {
        message = "This file is larger than 5 MB.";
      }
      if (code === "file-invalid-type") {
        message = "Only PDF files are allowed.";
      }
    }
    notifications.show({ color: "red", title: "File not accepted", message: message });
  }

  return (
    <>
      <PageHeader
        title="My CVs"
        description="Upload your CV as a PDF. You choose which CV to send when you apply for a job."
      />

      <Dropzone
        onDrop={handleDrop}
        onReject={handleReject}
        maxSize={MAX_SIZE}
        accept={[MIME_TYPES.pdf]}
        multiple={false}
        loading={uploadMutation.isPending}
        radius="lg"
        mb="lg"
        bg={SURFACE}
      >
        <Group justify="center" gap="lg" mih={130} style={{ pointerEvents: "none" }}>
          <Dropzone.Accept>
            <IconUpload size={40} color="#47DC9A" />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={40} color="#F87171" />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <IconFileText size={40} color="#8FA099" />
          </Dropzone.Idle>

          <div>
            <Text size="lg" fw={600}>
              Drop your CV here, or click to choose a file
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              PDF only, up to 5 MB.
            </Text>
          </div>
        </Group>
      </Dropzone>

      <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />} mb="lg">
        Use a PDF with real text. A scanned picture of a page cannot be read, so no skills will be found.
      </Alert>

      {resumesQuery.isPending && <ListSkeleton rows={2} height={110} />}
      {resumesQuery.isError && <ErrorAlert error={resumesQuery.error} title="Could not load your CVs" />}

      {resumesQuery.isSuccess && resumesQuery.data.length === 0 && (
        <Paper>
          <EmptyState
            icon={<IconFileText size={24} />}
            title="No CV uploaded yet"
            text="Upload your first CV above. Recruiters read it when you apply."
          />
        </Paper>
      )}

      {resumesQuery.isSuccess && resumesQuery.data.length > 0 && (
        <Stack gap="sm">
          {resumesQuery.data.map(function (resume) {
            return <ResumeRow key={resume.id} resume={resume} />;
          })}
        </Stack>
      )}
    </>
  );
}
