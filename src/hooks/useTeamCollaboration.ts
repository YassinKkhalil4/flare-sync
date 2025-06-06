
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export const useTeamCollaboration = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState<string>('admin');

  const loadTeamData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // For now, we'll use mock data since we don't have team tables yet
      // In a real implementation, this would fetch from Supabase
      const mockMembers: TeamMember[] = [
        {
          id: user.id,
          name: user.user_metadata?.full_name || 'You',
          email: user.email || '',
          role: 'admin',
          status: 'active',
          joinedAt: new Date().toISOString()
        }
      ];

      setMembers(mockMembers);
      setInvitations([]);
    } catch (error) {
      console.error('Error loading team data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inviteTeamMember = async (email: string, role: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // In a real implementation, this would:
      // 1. Create an invitation record in the database
      // 2. Send an email invitation
      // 3. Return the invitation details

      const newInvitation: TeamInvitation = {
        id: `inv-${Date.now()}`,
        email,
        role,
        invitedBy: user.id,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      setInvitations(prev => [...prev, newInvitation]);
      
      // Mock email sending
      console.log(`Invitation sent to ${email} with role ${role}`);
      
      return newInvitation;
    } catch (error) {
      console.error('Error inviting team member:', error);
      throw error;
    }
  };

  const removeTeamMember = async (memberId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // In a real implementation, this would remove the member from the database
      setMembers(prev => prev.filter(member => member.id !== memberId));
      
      toast({
        title: 'Member Removed',
        description: 'Team member has been removed successfully'
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // In a real implementation, this would update the member's role in the database
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, role: newRole as 'viewer' | 'editor' | 'admin' }
          : member
      ));
      
      toast({
        title: 'Role Updated',
        description: 'Member role has been updated successfully'
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      
      toast({
        title: 'Invitation Cancelled',
        description: 'Invitation has been cancelled'
      });
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadTeamData();
  }, [user]);

  return {
    members,
    invitations,
    userRole,
    isLoading,
    inviteTeamMember,
    removeTeamMember,
    updateMemberRole,
    cancelInvitation,
    refreshTeamData: loadTeamData
  };
};
