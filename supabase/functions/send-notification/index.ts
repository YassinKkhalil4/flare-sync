
import { serve } from 'https://deno.land/std@0.170.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  userId: string;
  type: 'social_event' | 'system_alert' | 'approval_request' | 'content_published';
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  imageUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const notificationData: NotificationRequest = await req.json();
    
    // Validate input
    if (!notificationData.userId || !notificationData.type || !notificationData.title || !notificationData.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }), 
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check user notification preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', notificationData.userId)
      .single();

    if (preferencesError && preferencesError.code !== 'PGRST116') { // Not found error
      console.error('Error fetching notification preferences:', preferencesError);
      // Continue with default preferences (all enabled)
    }

    // If no preferences found or specific type is enabled
    if (!preferences || 
        (notificationData.type === 'social_event' && preferences.social_events_enabled) || 
        (notificationData.type === 'system_alert' && preferences.system_alerts_enabled) ||
        (notificationData.type === 'approval_request' && preferences.approval_requests_enabled) ||
        (notificationData.type === 'content_published' && preferences.content_published_enabled)) {
      
      // Create in-app notification
      const { data: notification, error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.userId,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          related_entity_type: notificationData.relatedEntityType,
          related_entity_id: notificationData.relatedEntityId,
          image_url: notificationData.imageUrl,
          is_read: false
        })
        .select()
        .single();

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        return new Response(
          JSON.stringify({ error: 'Failed to create notification' }), 
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // If email notifications are enabled, send email (would be implemented with an email service)
      if (preferences?.email_enabled) {
        // This would be where you'd integrate an email service like SendGrid or Resend
        console.log('Would send email notification to user', notificationData.userId);
        // Implementation would go here
      }

      return new Response(
        JSON.stringify({ success: true, data: notification }), 
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Notifications of this type are disabled by user preferences' }), 
        { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
  } catch (error) {
    console.error('Error processing notification request:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
