"use client";
import Papa from "papaparse";
import { useEffect, useState } from "react";
import React from "react";

interface Profile {
  번호: string;
  연령대: string;
  성별: string;
  지역: string;
  포지션: string;
  장르: string;
  경력: string;
  링크: string;
}

function getYoutubeEmbedUrl(url: string) {
  if (!url) return null;
  // Handle YouTube Shorts and normal links
  const shortsMatch = url.match(/youtube\.com\/shorts\/([\w-]+)/);
  if (shortsMatch) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }
  const normalMatch = url.match(/youtube\.com\/watch\?v=([\w-]+)/);
  if (normalMatch) {
    return `https://www.youtube.com/embed/${normalMatch[1]}`;
  }
  return url;
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    fetch("/ai_test_3.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse<Profile>(text, { header: true });
        setProfiles(parsed.data.filter((p: Profile) => p.연령대));
      });
  }, []);

  const handleSelect = (idx: number) => {
    setSuccess(false);
    setError("");
    setSubmitted(false);
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSubmit = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/submit-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serials: selected }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSuccess(true);
      setSubmitted(true);
      setSelected([]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold mb-8">원하는 후보를 선택 후 제출해주세요</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">선택하신 후보들의 연락처는 문자로 전달드리겠습니다</div>}
      {!success && (
        <>
          <button
            className={`mb-6 px-6 py-3 rounded bg-blue-500 text-white font-semibold shadow hover:bg-blue-600 transition-all duration-150 ${selected.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={loading || submitted || selected.length === 0}
            onClick={handleSubmit}
          >
            {loading ? "Submitting..." : submitted ? "Submitted" : `제출하기`}
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-6xl">
            {profiles.map((profile, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border instagram-card transition-all duration-200 cursor-pointer select-none
                  ${selected.includes(idx)
                    ? "border-4 border-blue-600 ring-4 ring-blue-200 bg-blue-50 scale-105 shadow-2xl"
                    : "border-neutral-200 hover:border-blue-400 hover:shadow-xl"}
                `}
                style={{ aspectRatio: "3/4" }}
                onClick={() => handleSelect(idx)}
              >
                <div className="w-24 h-24 bg-gradient-to-tr from-pink-400 via-yellow-400 to-purple-500 rounded-full mb-4 flex items-center justify-center text-white text-3xl font-bold">
                  <span>{profile.성별 === "남자" ? "👨" : "👩"}</span>
                </div>
                <div className="text-2xl font-bold mb-1">{profile.포지션 || "?"}</div>
                <div className="text-lg font-semibold mb-1">{profile.연령대} {profile.성별}</div>
                <div className="text-sm text-neutral-500 mb-2">{profile.지역}</div>
                <div className="text-sm mb-1">장르: {profile.장르}</div>
                <div className="text-sm mb-1">경력: {profile.경력}</div>
                {profile.링크 && getYoutubeEmbedUrl(profile.링크) && (
                  <div className="w-full aspect-video mt-4 rounded-lg overflow-hidden border border-neutral-200">
                    <iframe
                      src={getYoutubeEmbedUrl(profile.링크) || undefined}
                      title="Profile Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
