import { z } from 'zod';

/**
 * Bangladeshi mobile number validation regex
 * Accepts formats: 013XXXXXXXX, 014XXXXXXXX, 015XXXXXXXX, 016XXXXXXXX, 017XXXXXXXX, 018XXXXXXXX, 019XXXXXXXX
 * Also handles optional +88 or 88 prefix
 */
const bangladeshiPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

export const orderCheckoutSchema = z.object({
  customerName: z
    .string()
    .min(2, { message: 'অনুগ্রহ করে আপনার পুরো নাম লিখুন (কমপক্ষে ২ অক্ষর)' })
    .max(80, { message: 'নাম সর্বোচ্চ ৮০ অক্ষরের মধ্যে হতে হবে' })
    .trim(),
  phone: z
    .string()
    .trim()
    .refine((val) => bangladeshiPhoneRegex.test(val.replace(/[\s-]/g, '')), {
      message: 'একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)',
    }),
  address: z
    .string()
    .min(5, { message: 'অনুগ্রহ করে পূর্ণ ডেলিভারি ঠিকানা লিখুন (বাসা/রোড/এলাকা)' })
    .max(250, { message: 'ঠিকানা সর্বোচ্চ ২৫০ অক্ষরের মধ্যে হতে হবে' })
    .trim(),
  district: z.string().optional().default(''),
  upazila: z.string().optional().default(''),
  quantity: z
    .number()
    .int()
    .min(1, { message: 'কমপক্ষে ১টি পণ্য অর্ডার করতে হবে' })
    .max(20, { message: 'একবারে সর্বোচ্চ ২০টি পণ্য অর্ডার করা যাবে' }),
  orderNotes: z.string().max(300).optional(),
});

export type OrderCheckoutInput = z.infer<typeof orderCheckoutSchema>;

export const productSchema = z.object({
  name: z.string().min(3).max(150),
  slug: z.string().min(3).max(150),
  brand: z.string().min(2).max(80),
  volume: z.string().min(2).max(50),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  deliveryCharge: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  isAvailable: z.boolean().default(true),
  sku: z.string().min(2).max(50),
  description: z.string().min(10),
});

export type ProductInput = z.infer<typeof productSchema>;
