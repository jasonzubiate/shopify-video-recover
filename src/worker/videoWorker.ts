import { Worker } from "bullmq";
import { prisma } from "@/prisma";
import { textToSpeech } from "@/lib/elevenlabs/create";
import { createPromoImage } from "@/lib/canva/create";
import ffmpegPath from "ffmpeg-static";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const worker = new Worker("video", async (job) => {
  const checkout = await prisma.checkout.findUnique({
    where: { id: job.data.checkoutId },
  });
  if (!checkout) return;

  // 1. Generate personalized audio with ElevenLabs
  const audioBuffer = await textToSpeech(
    `Hey ${
      checkout.customerName || "there"
    }, sad to see you go! Here's 10% off ${checkout.productName}.`
  );
  const audioPath = path.join("/tmp", `${checkout.id}.mp3`);
  fs.writeFileSync(audioPath, audioBuffer);

  // 2. Generate branded image with Canva API
  const promoImageUrl = await createPromoImage(
    checkout.productImage,
    "10% OFF - Complete Your Purchase"
  );
  const imageRes = await fetch(promoImageUrl);
  const imageBuffer = Buffer.from(await imageRes.arrayBuffer());
  const imagePath = path.join("/tmp", `${checkout.id}.png`);
  fs.writeFileSync(imagePath, imageBuffer);

  // 3. Combine into video with ffmpeg
  const videoPath = path.join("/tmp", `${checkout.id}.mp4`);
  await new Promise((resolve, reject) => {
    ffmpeg()
      .setFfmpegPath(ffmpegPath)
      .addInput(imagePath)
      .loop(5) // 5 seconds
      .addInput(audioPath)
      .outputOptions("-c:v libx264", "-c:a aac", "-shortest")
      .save(videoPath)
      .on("end", resolve)
      .on("error", reject);
  });

  // 4. Upload to storage
  const storageUrl = `https://srngsosrdblbgysmtlyh.storage.supabase.co/storage/v1/s3/${checkout.id}.mp4`;

  // 5. Save in DB
  await prisma.checkout.update({
    where: { id: checkout.id },
    data: { videoUrl: storageUrl },
  });

  // Send email
  await fetch("/api/send");
});

worker.on("completed", (job) => console.log(`Job ${job.id} completed`));
worker.on("failed", (job, err) =>
  console.error(`Job ${job?.id} failed: ${err}`)
);
