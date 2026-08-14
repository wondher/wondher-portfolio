import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  company: z.string().max(160).optional(),
  message: z.string().min(10).max(4000),
  website: z.string().optional(), // honeypot — humano não vê o campo
});
export type Inquiry = z.infer<typeof inquirySchema>;
