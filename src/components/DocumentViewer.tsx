// components/DocumentViewer.tsx
"use client";

import { FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface DocumentViewerProps {
  documents: {
    id: number;
    name: string;
    file_url: string;
    document_type: string;
  }[];
  permitType?: {
    id: number;
    name: string;
    required_documents?: {
      document_type_id: string;
    }[];
  };
  readonly?: boolean;
}

export function DocumentViewer({ documents, permitType, readonly = false }: DocumentViewerProps) {
  // Check if document is required
  const isRequired = (docType: string) => {
    return permitType?.required_documents?.some(
      (req) => req.document_type_id === docType
    );
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span>{doc.name}</span>
              {isRequired(doc.document_type) && (
                <Badge variant="outline">Required</Badge>
              )}
            </TableCell>
            <TableCell>{doc.document_type}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(doc.file_url, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = doc.file_url;
                    link.download = doc.name;
                    link.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}