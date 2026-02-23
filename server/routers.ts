import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import crypto from "crypto";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Consent management
  consent: router({
    record: protectedProcedure
      .input(
        z.object({
          consentGiven: z.boolean(),
          ipAddress: z.string().optional(),
          userAgent: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const consentId = await db.recordConsent({
          userId: ctx.user.id,
          consentGiven: input.consentGiven,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        });
        return { consentId };
      }),

    check: protectedProcedure.query(async ({ ctx }) => {
      const hasConsented = await db.hasUserConsented(ctx.user.id);
      return { hasConsented };
    }),
  }),

  // Face registration
  face: router({
    register: protectedProcedure
      .input(
        z.object({
          photoBase64: z.string(),
          registeredName: z.string().min(1).max(255),
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const hasConsented = await db.hasUserConsented(ctx.user.id);
        if (!hasConsented) {
          throw new Error("User has not given consent to store photos");
        }

        const canRegister = await db.checkRateLimit(ctx.user.id, "face.register", 5, 3600000);
        if (!canRegister) {
          throw new Error("Rate limit exceeded. Maximum 5 registrations per hour.");
        }

        const photoBuffer = Buffer.from(input.photoBase64, "base64");
        const fileKey = `users/${ctx.user.id}/faces/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.jpg`;
        const { url: photoUrl } = await storagePut(fileKey, photoBuffer, input.mimeType);

        const analysis = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "You are a face detection system. Analyze photos and return JSON with face detection results.",
            },
            {
              role: "user",
              content: `Analyze the photo at ${photoUrl} for faces. Return JSON: { faceDetected: boolean, faceCount: number, qualityScore: number (0-1) }` as any,
            },
          ] as any,
          response_format: { type: "json_object" },
        });

        let faceAnalysis = {
          faceDetected: true,
          faceCount: 1,
          qualityScore: 0.8,
        };

        try {
          const content = analysis.choices[0].message.content;
          const contentStr = typeof content === "string" ? content : JSON.stringify(content);
          const parsed = JSON.parse(contentStr);
          faceAnalysis = { ...faceAnalysis, ...parsed };
        } catch (e) {
          console.error("Failed to parse face analysis:", e);
        }

        if (!faceAnalysis.faceDetected) {
          throw new Error("No face detected in the provided image");
        }

        const registrationId = await db.registerFace({
          userId: ctx.user.id,
          photoUrl,
          registeredName: input.registeredName,
          qualityScore: faceAnalysis.qualityScore.toString(),
          faceDetected: faceAnalysis.faceDetected,
          metadata: faceAnalysis,
        });

        return {
          registrationId,
          photoUrl,
          qualityScore: faceAnalysis.qualityScore,
          faceCount: faceAnalysis.faceCount,
        };
      }),

    listMy: protectedProcedure.query(async ({ ctx }) => {
      const registrations = await db.getUserFaceRegistrations(ctx.user.id);
      return registrations.map((reg) => ({
        id: reg.id,
        registeredName: reg.registeredName,
        photoUrl: reg.photoUrl,
        qualityScore: reg.qualityScore,
        createdAt: reg.createdAt,
      }));
    }),

    delete: protectedProcedure
      .input(z.object({ registrationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const registration = await db.getFaceRegistrationById(input.registrationId);
        if (!registration || registration.userId !== ctx.user.id) {
          throw new Error("Registration not found or access denied");
        }
        await db.deleteFaceRegistration(input.registrationId);
        return { success: true };
      }),
  }),

  // Face matching
  match: router({
    find: protectedProcedure
      .input(
        z.object({
          photoBase64: z.string(),
          mimeType: z.string().default("image/jpeg"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const canMatch = await db.checkRateLimit(ctx.user.id, "match.find", 20, 3600000);
        if (!canMatch) {
          throw new Error("Rate limit exceeded. Maximum 20 matches per hour.");
        }

        const photoBuffer = Buffer.from(input.photoBase64, "base64");
        const fileKey = `users/${ctx.user.id}/queries/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.jpg`;
        const { url: queryPhotoUrl } = await storagePut(fileKey, photoBuffer, input.mimeType);

        const allRegistrations = await db.getAllFaceRegistrations();

        if (allRegistrations.length === 0) {
          await db.recordMatch({
            userId: ctx.user.id,
            queryPhotoUrl,
            matchedUserId: null,
            matchedName: null,
            similarityScore: "0",
            confidenceLevel: "low",
          });
          return { matched: false, message: "No registered faces to match against" };
        }

        const registrationDescriptions = allRegistrations
          .map((reg) => `ID: ${reg.id}, Name: ${reg.registeredName}`)
          .join("; ");

        const matchAnalysis = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a facial recognition expert. Compare photos and return the best match.",
            },
            {
              role: "user",
              content: `Compare the photo at ${queryPhotoUrl} with these registered faces: ${registrationDescriptions}. Return JSON: { bestMatchId: number | null, bestMatchName: string | null, similarityScore: number (0-1) }` as any,
            },
          ] as any,
          response_format: { type: "json_object" },
        });

        let matchResult = {
          bestMatchId: null as number | null,
          bestMatchName: null as string | null,
          similarityScore: 0,
        };

        try {
          const content = matchAnalysis.choices[0].message.content;
          const contentStr = typeof content === "string" ? content : JSON.stringify(content);
          const parsed = JSON.parse(contentStr);
          matchResult = { ...matchResult, ...parsed };
        } catch (e) {
          console.error("Failed to parse match analysis:", e);
        }

        let confidenceLevel: "low" | "medium" | "high" = "low";
        if (matchResult.similarityScore > 0.8) {
          confidenceLevel = "high";
        } else if (matchResult.similarityScore > 0.6) {
          confidenceLevel = "medium";
        }

        const matchId = await db.recordMatch({
          userId: ctx.user.id,
          queryPhotoUrl,
          matchedUserId: matchResult.bestMatchId,
          matchedName: matchResult.bestMatchName,
          similarityScore: matchResult.similarityScore.toString(),
          confidenceLevel,
        });

        return {
          matchId,
          matched: matchResult.bestMatchId !== null && matchResult.similarityScore > 0.6,
          matchedName: matchResult.bestMatchName,
          similarityScore: matchResult.similarityScore,
          confidenceLevel,
        };
      }),

    history: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        const history = await db.getUserMatchHistory(ctx.user.id, input.limit);
        return history.map((match) => ({
          id: match.id,
          matchedName: match.matchedName,
          similarityScore: parseFloat(match.similarityScore || "0"),
          confidenceLevel: match.confidenceLevel,
          createdAt: match.createdAt,
        }));
      }),
  }),

  // User profile
  user: router({
    profile: protectedProcedure.query(async ({ ctx }) => {
      return {
        id: ctx.user.id,
        name: ctx.user.name,
        email: ctx.user.email,
        createdAt: ctx.user.createdAt,
      };
    }),

    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      await db.deleteUserData(ctx.user.id);
      return { success: true, message: "Account and all data deleted" };
    }),
  }),
});

export type AppRouter = typeof appRouter;
