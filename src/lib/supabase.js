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

    // Clean up old messages to keep only 100 most recent
    await this.cleanupOldMessages()
    
    return data
  },

  // Clean up old messages to keep only 100 most recent
  async cleanupOldMessages() {
    try {
      // Get the count of total messages
      const { count, error: countError } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.error('Error counting messages:', countError)
        return
      }

      // If we have more than 100 messages, delete the oldest ones
      if (count > 100) {
        const messagesToDelete = count - 100
        
        // Get the IDs of the oldest messages to delete
        const { data: oldMessages, error: selectError } = await supabase
          .from('chat_messages')
          .select('id')
          .order('created_at', { ascending: true })
          .limit(messagesToDelete)
        
        if (selectError) {
          console.error('Error selecting old messages:', selectError)
          return
        }

        if (oldMessages && oldMessages.length > 0) {
          const idsToDelete = oldMessages.map(msg => msg.id)
          
          // Delete the oldest messages
          const { error: deleteError } = await supabase
            .from('chat_messages')
            .delete()
            .in('id', idsToDelete)
          
          if (deleteError) {
            console.error('Error deleting old messages:', deleteError)
          } else {
            console.log(`Cleaned up ${idsToDelete.length} old messages`)
          }
        }
      }
    } catch (error) {
      console.error('Error in cleanupOldMessages:', error)
    }
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
