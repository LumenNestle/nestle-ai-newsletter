import axios from 'axios'
import { apiBaseUrl } from '../config/api'

export type NewsletterStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'RESUBMITTED'
  | 'APPROVED'
  | 'DISCARDED'

export async function updateNewsletterStatus(
  newsletterId: string,
  state: NewsletterStatus,
): Promise<void> {
  await axios.post(`${apiBaseUrl}/newsletters/${newsletterId}/status`, { state })
}
