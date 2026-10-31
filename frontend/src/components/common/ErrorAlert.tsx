import { Alert } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { getErrorMessage } from "../../api/client";

interface Props {
  error: unknown;
  title?: string;
}

export default function ErrorAlert({ error, title = "Could not load this page" }: Props) {
  return (
    <Alert color="red" variant="light" icon={<IconAlertTriangle size={18} />} title={title}>
      {getErrorMessage(error)}
    </Alert>
  );
}
