"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "@/components/Navbar"
import FileUpload from "@/components/FileUpload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { uploadJD, uploadResumes } from "@/lib/api"

const HRDashboard = () => {
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null)
  const [jobDescriptionText, setJobDescriptionText] = useState("")
  const [resumes, setResumes] = useState<File[]>([])
  const [processing, setProcessing] = useState(false)
  const [inputMethod, setInputMethod] = useState<"text" | "upload">("upload")
  const navigate = useNavigate()

  const handleJobDescriptionUpload = (files: File[]) => {
    if (files.length > 0) {
      setJobDescriptionFile(files[0])
      setJobDescriptionText("") // Clear any text JD
    }
  }

  const handleResumeUpload = (files: File[]) => {
    setResumes(files)
  }

  const handleProcess = async () => {
    if (resumes.length === 0) {
      alert("Please upload at least one resume")
      return
    }

    if (inputMethod === "upload" && !jobDescriptionFile) {
      alert("Please upload a job description file")
      return
    }

    if (inputMethod === "text" && !jobDescriptionText.trim()) {
      alert("Please enter a job description")
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
      } else if (inputMethod === "text" && jobDescriptionText.trim()) {
        console.log("Creating text file from JD input")
        // Create a text file from the input
        const textBlob = new Blob([jobDescriptionText], { type: "text/plain" })
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">HR Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Description Section */}
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>Provide the job description to match against candidate resumes</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="upload" onValueChange={(val) => setInputMethod(val as "text" | "upload")}>
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="text">Enter Text</TabsTrigger>
                </TabsList>

                <TabsContent value="upload">
                  <FileUpload
                    multiple={false}
                    accept=".pdf,.txt"
                    label="Upload Job Description"
                    onUploadComplete={handleJobDescriptionUpload}
                    uploadId="jd-upload"
                  />
                </TabsContent>

                <TabsContent value="text">
                  <textarea
                    className="w-full min-h-[240px] p-3 border rounded-md"
                    placeholder="Paste job description here..."
                    value={jobDescriptionText}
                    onChange={(e) => setJobDescriptionText(e.target.value)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter>
              {jobDescriptionFile && inputMethod === "upload" && (
                <Alert className="w-full">
                  <AlertTitle>Job Description Uploaded</AlertTitle>
                  <AlertDescription>{jobDescriptionFile.name} uploaded successfully</AlertDescription>
                </Alert>
              )}
            </CardFooter>
          </Card>

          {/* Resume Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Candidate Resumes</CardTitle>
              <CardDescription>Upload up to 100 candidate resumes for processing</CardDescription>
            </CardHeader>

            <CardContent>
              <FileUpload
                multiple={true}
                accept=".pdf"
                maxFiles={100}
                label="Upload Candidate Resumes"
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
        </div>

        {/* Process Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={handleProcess}
            disabled={
              processing ||
              resumes.length === 0 ||
              (inputMethod === "upload" && !jobDescriptionFile) ||
              (inputMethod === "text" && !jobDescriptionText.trim())
            }
            className="px-8 py-6 text-lg"
          >
            {processing ? "Processing..." : "Process Resumes"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default HRDashboard
