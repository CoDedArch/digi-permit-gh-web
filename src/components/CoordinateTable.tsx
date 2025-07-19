import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CoordinateTableProps {
  points: [number, number][];
  title: string;
  className?: string;
}

export function CoordinateTable({ points, title, className }: CoordinateTableProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-medium mb-2 text-muted-foreground">{title}</h3>
      {points.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">#</TableHead>
              <TableHead>Longitude</TableHead>
              <TableHead>Latitude</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {points.map(([lng, lat], index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-mono">{lng.toFixed(6)}</TableCell>
                <TableCell className="font-mono">{lat.toFixed(6)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-muted-foreground">No boundary data available</p>
      )}
    </div>
  );
}