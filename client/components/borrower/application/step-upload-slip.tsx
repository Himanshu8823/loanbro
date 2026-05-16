"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { useUploadSlip } from "@/hooks/use-loans";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StepUploadSlipProps {
  loanId: string;
  onSuccess: () => void;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE_MB = 5;

export function StepUploadSlip({ loanId, onSuccess }: StepUploadSlipProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadSlip, isPending } = useUploadSlip();

  const validateAndSetFile = (selected: File) => {
    setFileError("");

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setFileError("Only PDF, JPG, and PNG files are allowed");
      return;
    }

    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError("File size must not exceed 5MB");
      return;
    }

    setFile(selected);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSetFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) validateAndSetFile(selected);
  };

  const handleSubmit = () => {
    if (!file) return;

    uploadSlip(
      { loanId, file },
      {
        onSuccess: () => onSuccess(),
      }
    );
  };

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-slate-300 hover:border-primary/60 hover:bg-slate-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={handleFileChange}
        />

        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-700 mb-1">
          Drag and drop your salary slip here
        </p>
        <p className="text-xs text-slate-500">
          PDF, JPG, PNG — max 5MB
        </p>
      </div>

      {fileError && (
        <p className="text-sm text-red-500">{fileError}</p>
      )}

      {file && (
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-slate-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={!file || isPending}
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? "Uploading..." : "Upload & Continue"}
      </Button>
    </div>
  );
}