import { File, FileDoc, FileImage, FilePdf, FileXls, type Icon } from "@phosphor-icons/react";

const ICON_BY_EXTENSION: Record<string, Icon> = {
  pdf: FilePdf,
  jpg: FileImage,
  jpeg: FileImage,
  png: FileImage,
  doc: FileDoc,
  docx: FileDoc,
  xls: FileXls,
  xlsx: FileXls,
};

interface DocumentTypeIconProps {
  extension: string;
  className?: string;
}

export function DocumentTypeIcon({ extension, className }: DocumentTypeIconProps) {
  const IconComponent = ICON_BY_EXTENSION[extension.toLowerCase()] ?? File;
  return <IconComponent className={className} />;
}
