import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import "dotenv/config";

export async function textToSpeech(text: string) {
  const elevenlabs = new ElevenLabsClient();
  const audio = await elevenlabs.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
    text: text,
    modelId: "eleven_multilingual_v2",
    outputFormat: "mp3_44100_128",
  });

  return audio;
}
