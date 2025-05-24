import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FileText, File, Files, Upload } from "lucide-react";

interface FileUploadProps {
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  onUploadComplete: (files: File[]) => void;
  label: string;
  uploadId?: string; // Unique ID for input
}

const FileUpload = ({
  multiple = false,
  accept = ".pdf",
  maxFiles = 100,
  onUploadComplete,
  label,
  uploadId = "default",
}: FileUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const inputId = `file-upload-${uploadId}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      if (fileArray.length > maxFiles) {
        alert(`You can only upload a maximum of ${maxFiles} files`);
        return;
      }
      setFiles(fileArray);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files);
      if (fileArray.length > maxFiles) {
        alert(`You can only upload a maximum of ${maxFiles} files`);
        return;
      }

      const acceptedExtensions = accept.split(",").map((ext) => ext.trim());
      const filteredFiles = fileArray.filter((file) => {
        const extension = file.name.toLowerCase().split(".").pop() ?? "";
        return acceptedExtensions.some(
          (ext) => ext === `.${extension}` || ext === "*/*" || ext === ""
        );
      });

      if (filteredFiles.length < fileArray.length) {
        alert(
          `Some files were skipped because they don't match the accepted file types: ${accept}`
        );
      }

      setFiles(filteredFiles);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);

    // Simulate API call delay
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setUploading(false);
      onUploadComplete(files);
    }, 3000);
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <File className="h-4 w-4 mr-2" />;
    if (fileType.includes("text")) return <FileText className="h-4 w-4 mr-2" />;
    return <FileText className="h-4 w-4 mr-2" />;
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? "border-primary bg-primary/10" : "border-gray-300"}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <Label htmlFor={inputId} className="block text-lg font-medium text-gray-700">
          {label}
        </Label>

        <div className="mt-4 flex flex-col items-center justify-center gap-4">
          <Upload className="h-12 w-12 text-gray-400" />
          <Input
            id={inputId}
            type="file"
            multiple={multiple}
            accept={accept}
            className="sr-only"
            onChange={handleFileChange}
          />
          <Label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center px-6 py-3 bg-primary text-primary-foreground rounded-md shadow-sm text-base font-medium hover:bg-primary/90"
          >
            {multiple ? "Browse Files" : "Browse File"}
          </Label>
          <p className="mt-1 text-sm text-gray-500">
            {multiple ? (
              <>
                Drag and drop multiple files or click to browse
                <br />
                Upload up to {maxFiles} files
              </>
            ) : (
              "Drag and drop a file or click to browse"
            )}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Files className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {files.length} {files.length === 1 ? "file" : "files"} selected
            </span>
          </div>

          {files.length <= 10 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md border">
                  {getFileTypeIcon(file.type)}
                  <span className="text-sm truncate">{file.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {files.length} files selected. Too many to display individually.
            </p>
          )}

          {uploading && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2 w-full" />
              <p className="text-xs text-right text-gray-500">{progress}%</p>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
