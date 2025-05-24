"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import ResumeScoreCard, { type ScoreData } from "@/components/ResumeScoreCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { getRankedResults } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

const Results = () => {
  const [scores, setScores] = useState<ScoreData[]>([])
  const [selectedResume, setSelectedResume] = useState<ScoreData | null>(null)
  const [sortField, setSortField] = useState<keyof ScoreData>("final_ats_score")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("Fetching ranked results...")
        const fetchedScores = await getRankedResults()
        console.log("Received scores:", fetchedScores)

        if (Array.isArray(fetchedScores) && fetchedScores.length > 0) {
          setScores(fetchedScores)
          setSelectedResume(fetchedScores[0])
        } else {
          console.warn("No scores returned from API or invalid format:", fetchedScores)
          setScores([])
          setSelectedResume(null)
          setError("No results found. Please try processing your resumes again.")
        }
      } catch (error) {
        console.error("Failed to fetch scores:", error)
        setError(`Error fetching results: ${error instanceof Error ? error.message : "Unknown error"}`)
        toast({
          title: "Error",
          description: `Failed to fetch results: ${error instanceof Error ? error.message : "Unknown error"}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const sortedScores = [...scores].sort((a, b) => {
    const valA = Number(a[sortField])
    const valB = Number(b[sortField])
    return sortDirection === "asc" ? valA - valB : valB - valA
  })

  const handleSortChange = (field: keyof ScoreData) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600"
    if (score >= 40) return "text-yellow-600"
    return "text-red-600"
  }

  const handleRetry = async () => {
    await fetchData()
  }

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Retrying to fetch ranked results...")
      const fetchedScores = await getRankedResults()
      console.log("Received scores:", fetchedScores)

      if (Array.isArray(fetchedScores) && fetchedScores.length > 0) {
        setScores(fetchedScores)
        setSelectedResume(fetchedScores[0])
      } else {
        console.warn("No scores returned from API or invalid format:", fetchedScores)
        setScores([])
        setSelectedResume(null)
        setError("No results found. Please try processing your resumes again.")
      }
    } catch (error) {
      console.error("Failed to fetch scores:", error)
      setError(`Error fetching results: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast({
        title: "Error",
        description: `Failed to fetch results: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Resume Analysis Results</h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-600">Loading results...</p>
          </div>
        ) : error ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={handleRetry}>Retry</Button>
            </CardContent>
          </Card>
        ) : scores.length === 0 ? (
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No Results Found</CardTitle>
              <CardDescription>No resume analysis results are available.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button onClick={handleRetry}>Retry</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Resume List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Resume Rankings</CardTitle>
                  <CardDescription>Ranked by overall ATS score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4 text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={sortField === "final_ats_score" ? "text-brand-blue underline" : ""}
                      onClick={() => handleSortChange("final_ats_score")}
                    >
                      Overall {sortField === "final_ats_score" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={sortField === "skill_match" ? "text-brand-blue underline" : ""}
                      onClick={() => handleSortChange("skill_match")}
                    >
                      Skills {sortField === "skill_match" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={sortField === "experience_score" ? "text-brand-blue underline" : ""}
                      onClick={() => handleSortChange("experience_score")}
                    >
                      Experience {sortField === "experience_score" && (sortDirection === "asc" ? " ↑" : " ↓")}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {sortedScores.map((score, index) => (
                      <div
                        key={score.resume_filename}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedResume?.resume_filename === score.resume_filename
                            ? "bg-brand-blue bg-opacity-10 border border-brand-blue"
                            : "bg-white hover:bg-gray-50 border border-gray-200"
                        }`}
                        onClick={() => setSelectedResume(score)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                score.final_ats_score >= 70
                                  ? "bg-green-100 text-green-700"
                                  : score.final_ats_score >= 40
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 truncate max-w-[180px]">
                                {score.resume_filename}
                              </h4>
                              {score.bilstm_label && (
                                <div className="flex items-center mt-1">
                                  {score.bilstm_label === "Matched" ? (
                                    <div className="flex items-center text-green-600 text-xs">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      <span>Matched</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-red-600 text-xs">
                                      <XCircle className="w-3 h-3 mr-1" />
                                      <span>Not Matched</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`text-xl font-bold ${getScoreColor(score.final_ats_score)}`}>
                            {Math.round(score.final_ats_score)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Resume Details */}
            <div className="lg:col-span-2">
              {selectedResume ? (
                <ResumeScoreCard score={selectedResume} />
              ) : (
                <div className="text-center text-gray-500">Select a resume to view details</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Results
