import { Group, Pagination, Text } from "@mantine/core";

interface Props {
  page: number;
  totalPages: number;
  totalCount: number;
  noun: string;
  onChange: (page: number) => void;
}

export default function PagerFooter({ page, totalPages, totalCount, noun, onChange }: Props) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <Group justify="space-between" mt="lg" wrap="wrap">
      <Text size="sm" c="dimmed">
        {totalCount} {noun}
      </Text>
      {totalPages > 1 && <Pagination total={totalPages} value={page} onChange={onChange} size="sm" />}
    </Group>
  );
}
