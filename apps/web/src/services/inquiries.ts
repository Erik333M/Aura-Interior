import type { CreateInquiryInput, CreateReviewInput } from '@aura/types';
import { request } from './client.js';

export interface InquiryAccepted {
  id: string;
  status: string;
  message: string;
}

/** THE conversion call. Everything else on the site exists to lead here. */
export function createInquiry(input: CreateInquiryInput): Promise<InquiryAccepted> {
  return request<InquiryAccepted>('/inquiries', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function createReview(input: CreateReviewInput): Promise<InquiryAccepted> {
  return request<InquiryAccepted>('/reviews', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
