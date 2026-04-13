"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAttachments, useUploadAttachment } from "@/lib/tanstack/useAttachments";
import { MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES, AttachmentListItem } from "@/services/attachments/schema";
import { Download, FileIcon, FileImage, FileText, Loader2, LucideIcon, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

const Files = ({ leadId }: { leadId: string }) => {
  const [dragging, setDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)


  const { data: attachments, isLoading, isError } = useAttachments(leadId)
  const uploadMutation = useUploadAttachment(leadId)

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`File is too large. Maximum size is ${MAX_FILE_SIZE_BYTES} bytes.`)
      return
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      toast.error(`File type not allowed. Allowed types are ${ALLOWED_MIME_TYPES.join(", ")}.`)
      return
    }

    try {
      uploadMutation.mutate(file)
      toast.success(`${file.name} uploaded successfully`)
    } catch (error) {
      const message = error instanceof Error ? error.message : "An unknown error occurred"
      toast.error(message)
    }
  }

  return (
    <Card>
      <CardContent className="space-y-4 py-6">
        {/* Upload zone */}
        <div
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition ${dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25"
            }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag a file here, or click to upload
          </p>
          <p className="text-xs text-muted-foreground">
            PDF, PNG, JPG, DOCX · up to 10 MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploadMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>Choose file</>
            )}
          </Button>
        </div>

        {/* File list */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-destructive">
            Failed to load attachments.
          </p>
        ) : !attachments || attachments.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No files yet. Uploads appear here and in the activity timeline.
          </p>
        ) : (
          <ul className="divide-y rounded-md border">
            {attachments.map((a) => {
              const Icon = iconFor(a.mimeType);
              return <FileRow key={a.id} attachment={a} Icon={Icon} />
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default Files

// ------------------------------------------------------------------
// FileRow — one row per attachment
// ------------------------------------------------------------------
function FileRow({ attachment, Icon }: { attachment: AttachmentListItem, Icon: LucideIcon }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{attachment.fileName}</p>
        <p className="text-xs text-muted-foreground">
          {formatSize(attachment.sizeBytes)} ·{" "}
          uploaded by {attachment.uploadedBy.name} ·{" "}
          {new Date(attachment.createdAt).toLocaleDateString()}
        </p>
      </div>
      <Button asChild size="sm" variant="outline">
        <a href={attachment.downloadUrl} target="_blank" rel="noreferrer">
          <Download className="mr-2 h-4 w-4" />
          Download
        </a>
      </Button>
    </li>
  );
}

// ------------------------------------------------------------------
// Helpers — colocated because they're only used here
// ------------------------------------------------------------------
function iconFor(mime: string) {
  if (mime.startsWith("image/")) return FileImage;
  if (mime === "application/pdf" || mime === "application/msword" || mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") return FileText;
  return FileIcon;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}