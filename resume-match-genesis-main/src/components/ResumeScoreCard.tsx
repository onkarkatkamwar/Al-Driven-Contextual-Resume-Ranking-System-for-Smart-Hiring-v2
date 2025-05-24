import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle } from "lucide-react";

export interface ScoreData {
  resume_filename: string;
  skill_match: number;
  experience_score: number;
  soft_skills_score: number;
  adaptability_score: number;
  final_ats_score: number;
  bilstm_predicted_class?: number;
  bilstm_prediction_probability?: number;
  bilstm_label?: string;
}

interface ResumeScoreCardProps {
  score: ScoreData;
  onClick?: () => void;
}

const ResumeScoreCard = ({ score, onClick }: ResumeScoreCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score: number) => {
    if (score >= 70) return "bg-green-600";
    if (score >= 40) return "bg-yellow-600";
    return "bg-red-600";
  };

  const safeRound = (value?: number) =>
    typeof value === "number" && !isNaN(value) ? Math.round(value) : 0;

  return (
    <Card
      className="p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3
            className="text-lg font-semibold text-gray-900 truncate max-w-xs"
            title={score.resume_filename}
          >
            {score.resume_filename}
          </h3>
          {score.bilstm_label && (
            <div className="mt-2 flex items-center">
              {score.bilstm_label === "Matched" ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Matched</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <XCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">Not Matched</span>
                </div>
              )}
              <span className="text-xs text-gray-500 ml-2">
                ({((score.bilstm_prediction_probability ?? 0) * 100).toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 flex items-center justify-center group">
              <span
                className={`text-3xl font-bold ${getScoreColor(score.final_ats_score)}`}
                title="Final ATS Score"
              >
                {safeRound(score.final_ats_score)}
              </span>
            </div>
            <svg
              className="w-24 h-24"
              viewBox="0 0 36 36"
              aria-label={`Final ATS Score: ${safeRound(score.final_ats_score)}%`}
            >
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e6e6e6"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={
                  score.final_ats_score >= 70
                    ? "#10b981"
                    : score.final_ats_score >= 40
                    ? "#f59e0b"
                    : "#ef4444"
                }
                strokeWidth="2"
                strokeDasharray={`${score.final_ats_score}, 100`}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <ScoreBar
          label="Skill Match"
          value={score.skill_match}
          getScoreColor={getScoreColor}
          getProgressColor={getProgressColor}
        />
        <ScoreBar
          label="Experience"
          value={score.experience_score}
          getScoreColor={getScoreColor}
          getProgressColor={getProgressColor}
        />
        <ScoreBar
          label="Soft Skills"
          value={score.soft_skills_score}
          getScoreColor={getScoreColor}
          getProgressColor={getProgressColor}
        />
        <ScoreBar
          label="Adaptability"
          value={score.adaptability_score}
          getScoreColor={getScoreColor}
          getProgressColor={getProgressColor}
        />
      </div>
    </Card>
  );
};

interface ScoreBarProps {
  label: string;
  value: number;
  getScoreColor: (score: number) => string;
  getProgressColor: (score: number) => string;
}

const ScoreBar = ({ label, value, getScoreColor, getProgressColor }: ScoreBarProps) => {
  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-semibold ${getScoreColor(safeValue)}`}>
          {Math.round(safeValue)}%
        </span>
      </div>
      <Progress
        value={safeValue}
        className={`h-3 rounded-full ${getProgressColor(safeValue)}`}
        aria-label={`${label} score`}
      />
    </div>
  );
};

export default ResumeScoreCard;
