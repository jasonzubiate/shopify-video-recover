import * as React from "react";

interface EmailTemplateProps {
  videoUrl: string;
}

export function EmailTemplate({ videoUrl }: EmailTemplateProps) {
  return (
    <div className="flex flex-col gap-2 p-8">
      <h1>We made this for you:</h1>
      <a href={videoUrl}>Watch Video</a>
    </div>
  );
}
