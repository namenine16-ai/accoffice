"use client";

import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ChartCardColumn {
  key: string;
  label: string;
}

interface ChartCardProps {
  title: string;
  description?: string;
  tableColumns: ChartCardColumn[];
  tableRows: Array<Record<string, string | number>>;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  tableColumns,
  tableRows,
  children,
}: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        <CardAction>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTable((prev) => !prev)}
          >
            {showTable ? "แสดงกราฟ" : "แสดงตาราง"}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {showTable ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b">
                  {tableColumns.map((column) => (
                    <th key={column.key} className="p-2 font-medium text-muted-foreground">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <tr key={index} className="border-b last:border-0">
                    {tableColumns.map((column) => (
                      <td key={column.key} className="p-2 tabular-nums">
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
