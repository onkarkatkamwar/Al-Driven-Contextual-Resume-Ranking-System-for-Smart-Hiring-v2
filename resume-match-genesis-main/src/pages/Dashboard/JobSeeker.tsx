"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import FileUpload from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadJD, uploadResumes } from "@/lib/api"

const JobSeekerDashboard = () => {
  const [resumes, setResumes] = useState<File[]>([])
  const [jobDescription, setJobDescription] = useState("")
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [inputMethod, setInputMethod] = useState<"text" | "upload">("text")
  const navigate = useNavigate()

  const handleResumeUpload = (files: File[]) => {
    if (files.length > 0) {
      setResumes(files)
    }
  }

  const handleJobDescriptionUpload = (files: File[]) => {
    if (files.length > 0) {
      setJobDescriptionFile(files[0])
      // Reset text input when a file is uploaded
      setJobDescription("")
      setInputMethod("upload")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (resumes.length === 0) {
      alert("Please upload at least one resume")
      return
    }

    if (inputMethod === "text" && !jobDescription) {
      alert("Please enter a job description")
      return
    }

    if (inputMethod === "upload" && !jobDescriptionFile) {
      alert("Please upload a job description file")
      return
    }

    setProcessing(true)

    try {
      console.log("Starting upload process...")

      // Upload JD
      if (inputMethod === "upload" && jobDescriptionFile) {
        console.log("Uploading JD file:", jobDescriptionFile.name)
        const jdResponse = await uploadJD(jobDescriptionFile)
        console.log("JD upload response:", jdResponse)
      } else if (inputMethod === "text" && jobDescription) {
        console.log("Creating text file from JD input")
        // Create a text file from the input
        const textBlob = new Blob([jobDescription], { type: "text/plain" })
        const textFile = new File([textBlob], "job_description.txt", { type: "text/plain" })
        const jdResponse = await uploadJD(textFile)
        console.log("JD text upload response:", jdResponse)
      }

      // Upload resumes
      console.log(
        "Uploading resumes:",
        resumes.map((r) => r.name),
      )
      const resumesResponse = await uploadResumes(resumes)
      console.log("Resumes upload response:", resumesResponse)

      // Navigate to results
      navigate("/results")
    } catch (error) {
      console.error("Error processing:", error)
      alert(`An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Job Seeker Dashboard</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Upload Your Resumes</CardTitle>
                <CardDescription>Upload your resumes to analyze their match with job descriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  multiple={true}
                  accept=".pdf"
                  label="Upload Your Resumes"
                  onUploadComplete={handleResumeUpload}
                  uploadId="resume-upload"
                />
              </CardContent>
              <CardFooter>
                {resumes.length > 0 && (
                  <Alert className="w-full">
                    <AlertTitle>
                      {resumes.length} {resumes.length === 1 ? "Resume" : "Resumes"} Uploaded
                    </AlertTitle>
                    <AlertDescription>
                      {resumes.length} {resumes.length === 1 ? "resume has" : "resumes have"} been uploaded successfully
                    </AlertDescription>
                  </Alert>
                )}
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
                <CardDescription>Provide the job description to match against your resume</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="text" onValueChange={(value) => setInputMethod(value as "text" | "upload")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="text">Enter Text</TabsTrigger>
                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <textarea
                        id="job-description"
                        className="w-full min-h-[240px] p-3 border rounded-md"
                        placeholder="Paste job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="upload">
                    <FileUpload
                      multiple={false}
                      accept=".pdf,.txt"
                      label="Upload Job Description"
                      onUploadComplete={handleJobDescriptionUpload}
                      uploadId="job-desc-upload"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                {jobDescriptionFile && inputMethod === "upload" && (
                  <Alert className="w-full">
                    <AlertTitle>Job Description Uploaded</AlertTitle>
                    <AlertDescription>{jobDescriptionFile.name} has been uploaded successfully</AlertDescription>
                  </Alert>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              type="submit"
              size="lg"
              disabled={
                resumes.length === 0 ||
                (inputMethod === "text" && !jobDescription) ||
                (inputMethod === "upload" && !jobDescriptionFile) ||
                processing
              }
              className="px-8 py-6 text-lg"
            >
              {processing ? "Analyzing..." : "Analyze Resumes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default JobSeekerDashboard
