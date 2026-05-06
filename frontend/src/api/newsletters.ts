import axios from 'axios'

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
  await axios.post(`/newsletters/${newsletterId}/status`, { state })
}
