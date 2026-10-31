import { Badge } from "@mantine/core";
import type { MantineSize } from "@mantine/core";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/constants";

interface Props {
  status: string;
  size?: MantineSize;
}

// One badge for application statuses and job statuses
export default function StatusBadge({ status, size = "md" }: Props) {
  const color = STATUS_COLORS[status] || "gray";
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge color={color} variant="light" size={size}>
      {label}
    </Badge>
  );
}
