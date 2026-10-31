import { Skeleton, Stack } from "@mantine/core";

interface Props {
  rows?: number;
  height?: number;
}

// Grey placeholder boxes that are shown while data is loading
export default function ListSkeleton({ rows = 4, height = 84 }: Props) {
  const items = Array.from({ length: rows }, function (_, index) {
    return index;
  });

  return (
    <Stack gap="sm">
      {items.map(function (index) {
        return <Skeleton key={index} height={height} radius="lg" />;
      })}
    </Stack>
  );
}
