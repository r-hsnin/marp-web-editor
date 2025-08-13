"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { logger } from "@/lib/logging/logger";
import { LOG_CATEGORIES } from "@/lib/logging/logCategories";
import type { SharedPresentationData } from "@/types/api";

export default function SharedPresentationPage() {
  const params = useParams();
  const shareId = params.shareId;

  const [presentation, setPresentation] =
    useState<SharedPresentationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [verifyingPassword, setVerifyingPassword] = useState(false);
  const [html, setHtml] = useState("");

  const renderPresentation = useCallback(
    async (presentationData: SharedPresentationData) => {
      try {
        const response = await fetch("/api/marp-render", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            markdown: presentationData.markdown,
            theme: presentationData.theme,
          }),
        });

        const data = await response.json();

        if (data.success && data.html) {
          setHtml(data.html);
        } else {
          setError("Failed to render presentation.");
        }
      } catch (error) {
        logger.error(
          LOG_CATEGORIES.RENDER,
          "Failed to render shared presentation",
          {
            shareId,
            error: (error as Error).message,
          }
        );
        setError("Failed to render presentation.");
      }
    },
    [shareId]
  );

  const fetchPresentation = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/${shareId}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setPresentation(data.presentation);
        if (data.presentation.hasPassword) {
          setPasswordRequired(true);
        } else {
          await renderPresentation(data.presentation);
        }
      } else if (response.status === 404) {
        setError("Shared presentation not found.");
      } else if (response.status === 410) {
        setError("This shared presentation has expired.");
      } else {
        setError(data.error || "Failed to load presentation.");
      }
    } catch (error) {
      logger.error(
        LOG_CATEGORIES.SHARE_ACCESS,
        "Failed to fetch shared presentation",
        {
          shareId,
          error: (error as Error).message,
        }
      );
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  }, [shareId, renderPresentation]);

  // Fetch presentation data
  useEffect(() => {
    if (!shareId) return;

    fetchPresentation();
  }, [shareId, fetchPresentation]);

  const verifyPassword = async () => {
    if (!password.trim()) {
      console.log("Toast should show: パスワードを入力してください");
      toast.error("パスワードを入力してください");
      return;
    }

    try {
      setVerifyingPassword(true);
      const response = await fetch(`/api/share/${shareId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setPasswordRequired(false);
        await renderPresentation(data.presentation);
      } else if (response.status === 401) {
        toast.error("パスワードが正しくありません");
      } else {
        toast.error(data.error || "パスワード認証に失敗しました");
      }
    } catch (error) {
      logger.error(LOG_CATEGORIES.AUTH, "Password verification failed", {
        shareId,
        error: (error as Error).message,
      });
      toast.error("ネットワークエラーが発生しました");
    } finally {
      setVerifyingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading presentation...</p>
          </div>
        </div>
        <Toaster
          theme="light"
          position="top-right"
          expand={true}
          richColors={true}
        />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">
              Unable to Load Presentation
            </h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
        <Toaster
          theme="light"
          position="top-right"
          expand={true}
          richColors={true}
        />
      </>
    );
  }

  if (passwordRequired) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-full max-w-md mx-4">
            <div className="bg-background border rounded-lg p-6">
              <div className="text-center mb-6">
                <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-xl font-semibold mb-2">
                  Password Protected
                </h1>
                <p className="text-muted-foreground">
                  This presentation is password protected. Please enter the
                  password to view it.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && verifyPassword()}
                    placeholder="Enter password"
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={verifyPassword}
                  disabled={verifyingPassword}
                  className="w-full"
                >
                  {verifyingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Access Presentation"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Toaster
          theme="light"
          position="top-right"
          expand={true}
          richColors={true}
        />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">
              {presentation?.title || "Shared Presentation"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Shared via Marp Web Editor
            </p>
          </div>
        </div>
      </header>

      {/* Presentation Content */}
      <div className="flex-1 overflow-auto bg-white">
        {html ? (
          <iframe
            srcDoc={html}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "white",
            }}
            title="Shared Marp Presentation"
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <Toaster
        theme="light"
        position="top-right"
        expand={true}
        richColors={true}
      />
    </div>
  );
}
