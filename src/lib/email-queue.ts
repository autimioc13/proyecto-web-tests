import { createClient } from '@supabase/supabase-js';
import { sendTemplateEmail, EmailQueueItem } from './email';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_RETRIES = 3;
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes

/**
 * Add email to queue
 */
export async function enqueueEmail(
  template: EmailQueueItem['template'],
  data: Record<string, any>,
  userId?: string
): Promise<void> {
  try {
    const { error } = await supabase.from('email_queue').insert([
      {
        user_id: userId || null,
        template,
        data,
        status: 'pending',
        retry_count: 0,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error('Error enqueueing email:', error);
      throw error;
    }

    console.log(`✓ Email enqueued: ${template}`);
  } catch (error) {
    console.error('Error in enqueueEmail:', error);
    throw error;
  }
}

/**
 * Process email queue - called by background job
 */
export async function processEmailQueue(): Promise<void> {
  console.log('Processing email queue...');

  try {
    // Get pending emails
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', MAX_RETRIES)
      .order('created_at', { ascending: true })
      .limit(10); // Process max 10 at a time

    if (fetchError) {
      console.error('Error fetching pending emails:', fetchError);
      throw fetchError;
    }

    if (!pendingEmails || pendingEmails.length === 0) {
      console.log('No pending emails to process');
      return;
    }

    console.log(`Processing ${pendingEmails.length} emails...`);

    // Process each email
    for (const email of pendingEmails) {
      await processEmail(email);
    }

    console.log('✓ Email queue processing complete');
  } catch (error) {
    console.error('Error processing email queue:', error);
  }
}

/**
 * Process individual email
 */
async function processEmail(email: EmailQueueItem): Promise<void> {
  try {
    if (!email.id) {
      throw new Error('Email ID is missing');
    }

    // Send email using template
    await sendTemplateEmail(email.template, email.data);

    // Mark as sent
    await supabase
      .from('email_queue')
      .update({
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', email.id);

    console.log(`✓ Email sent: ${email.id} (${email.template})`);
  } catch (error) {
    console.error(`Error processing email ${email.id}:`, error);

    // Increment retry count and set status
    const retryCount = (email.retry_count || 0) + 1;
    const status = retryCount >= MAX_RETRIES ? 'failed' : 'pending';

    await supabase
      .from('email_queue')
      .update({
        retry_count: retryCount,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', email.id);

    console.log(
      `✗ Email processing failed: ${email.id} (retry: ${retryCount}/${MAX_RETRIES})`
    );
  }
}

/**
 * Get email queue stats
 */
export async function getEmailQueueStats() {
  try {
    const { data, error } = await supabase.from('email_queue').select('status, count()');

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting email queue stats:', error);
    return [];
  }
}

/**
 * Retry failed emails (manual trigger)
 */
export async function retryFailedEmails(): Promise<void> {
  try {
    const { error } = await supabase
      .from('email_queue')
      .update({
        status: 'pending',
        retry_count: 0,
      })
      .eq('status', 'failed');

    if (error) throw error;

    console.log('✓ Failed emails marked for retry');
    await processEmailQueue();
  } catch (error) {
    console.error('Error retrying failed emails:', error);
    throw error;
  }
}

/**
 * Clear old sent emails (cleanup)
 */
export async function cleanupOldEmails(daysOld: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { error } = await supabase
      .from('email_queue')
      .delete()
      .eq('status', 'sent')
      .lt('created_at', cutoffDate.toISOString());

    if (error) throw error;

    console.log(`✓ Cleaned up emails older than ${daysOld} days`);
  } catch (error) {
    console.error('Error cleaning up old emails:', error);
    throw error;
  }
}
