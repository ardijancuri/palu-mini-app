import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Chat messages table operations
export const chatService = {
  // Get recent messages
  async getRecentMessages(limit = 50) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(limit)
    
    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }
    return data || []
  },

  // Send a new message
  async sendMessage(username, message, userIp = null) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([
        {
          username: username.trim(),
          message: message.trim(),
          user_ip: userIp
        }
      ])
      .select()
      .single()
    
    if (error) {
      console.error('Error sending message:', error)
      throw error
    }
    return data
  },

  // Subscribe to new messages
  subscribeToMessages(callback) {
    return supabase
      .channel('chat_messages')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages' 
        }, 
        (payload) => {
          callback(payload.new)
        }
      )
      .subscribe()
  },

  // Unsubscribe from messages
  unsubscribeFromMessages(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription)
    }
  }
}
