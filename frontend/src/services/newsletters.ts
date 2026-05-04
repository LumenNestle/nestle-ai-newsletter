import axios from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

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
