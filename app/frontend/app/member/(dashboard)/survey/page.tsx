"use client";

import { useEffect, useState } from "react";
import { apiPost } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ClipboardList, CheckCircle2 } from "lucide-react";

export default function MemberSurveyPage() {
  const { token, currentSlot } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [initStatus, setInitStatus] = useState<any>(null);
  const [question, setQuestion] = useState<any>(null);
  const [choices, setChoices] = useState<any[]>([]);
  const [selectedChoiceId, setSelectedChoiceId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [started, setStarted] = useState(false);

  const slotId = currentSlot?.slot_id;

  // Step 1: Check survey availability
  const checkSurveyInit = async () => {
    if (!token || !slotId) return;
    setLoading(true);
    try {
      const res = await apiPost("/api/member/survey_init", { slot_id: slotId }, token);
      setInitStatus(res);
    } catch {
      setInitStatus({ status: "error", status_message: "Failed to load survey status." });
    }
    setLoading(false);
  };

  // Step 2: Fetch next question
  const fetchQuestion = async () => {
    if (!token || !slotId) return;
    setLoadingQuestion(true);
    setSelectedChoiceId(null);
    try {
      const res = await apiPost("/api/member/survey_question", { slot_id: slotId }, token);
      if (res?.questions) {
        setQuestion(res.questions);
        const choicesData = (res.choices || []).map((c: any) => ({ ...c, selected: 0 }));
        setChoices(choicesData);
      } else {
        setQuestion(null);
        setChoices([]);
      }
    } catch {
      setQuestion(null);
      setChoices([]);
    }
    setLoadingQuestion(false);
  };

  // Step 3: Submit answer
  const handleSubmit = async () => {
    if (selectedChoiceId === null) {
      toast.error("Please select an answer.");
      return;
    }
    setSubmitting(true);
    try {
      const submitChoices = choices.map((c) => ({
        id: c.id,
        survey_question_id: c.survey_question_id,
        selected: c.id === selectedChoiceId ? 1 : 0,
      }));

      await apiPost("/api/member/survey_answer", {
        slot_id: slotId,
        choices: submitChoices,
      }, token);
      toast.success("Answer submitted! Points earned.");
      await fetchQuestion();
      const res = await apiPost("/api/member/survey_init", { slot_id: slotId }, token);
      setInitStatus(res);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit answer.");
    }
    setSubmitting(false);
  };

  useEffect(() => {
    checkSurveyInit();
  }, [token, slotId]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
  }

  if (initStatus?.status === "warning" || initStatus?.status === "error") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Survey</h1>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">{initStatus.status_message || "No surveys available."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Survey</h1>
        {initStatus?.status_message && (
          <p className="text-sm text-muted-foreground">{initStatus.status_message}</p>
        )}
      </div>

      {!started && !question && !loadingQuestion && (
        <Card>
          <CardContent className="py-10 text-center">
            <ClipboardList className="h-10 w-10 mx-auto mb-4 text-green-600" />
            <p className="text-lg font-semibold mb-2">Ready to Answer</p>
            <p className="text-muted-foreground mb-4">{initStatus?.status_message}</p>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => { setStarted(true); fetchQuestion(); }}>
              Start Survey
            </Button>
          </CardContent>
        </Card>
      )}

      {loadingQuestion && (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-green-600" /></div>
      )}

      {question && !loadingQuestion && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{question.survey_question || question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {choices.map((choice: any) => (
              <div
                key={choice.id}
                onClick={() => setSelectedChoiceId(choice.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedChoiceId === choice.id
                    ? "border-green-600 bg-green-50 dark:bg-green-950"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedChoiceId === choice.id ? "border-green-600" : "border-muted-foreground"
                  }`}>
                    {selectedChoiceId === choice.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                    )}
                  </div>
                  <span className="text-sm">{choice.survey_choices || choice.choice || choice.label}</span>
                </div>
              </div>
            ))}

            <div className="flex gap-2 pt-4">
              <Button
                className="bg-green-600 hover:bg-green-700 flex-1"
                onClick={handleSubmit}
                disabled={submitting || selectedChoiceId === null}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Submit Answer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {started && question === null && !loadingQuestion && choices.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-2 text-green-600" />
            <p>All available questions have been answered!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
