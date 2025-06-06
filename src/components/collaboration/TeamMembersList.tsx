
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Mail, Shield, User, Trash2 } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin';
  avatar?: string;
  status: 'active' | 'pending' | 'inactive';
  joinedAt: string;
}

interface TeamMembersListProps {
  members: TeamMember[];
  onRemoveMember: (memberId: string) => void;
  onUpdateRole: (memberId: string, role: string) => void;
  currentUserRole: string;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  members, 
  onRemoveMember, 
  onUpdateRole,
  currentUserRole 
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'editor': return <User className="h-4 w-4" />;
      default: return <Mail className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'editor': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const canManageMember = (memberRole: string) => {
    if (currentUserRole !== 'admin') return false;
    return memberRole !== 'admin'; // Admins can't remove other admins
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members ({members.length})</CardTitle>
        <CardDescription>
          Manage your team's access and permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{member.name}</p>
                    <Badge variant={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={getRoleColor(member.role)} className="flex items-center gap-1">
                  {getRoleIcon(member.role)}
                  {member.role}
                </Badge>

                {canManageMember(member.role) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'viewer')}>
                        Change to Viewer
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'editor')}>
                        Change to Editor
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUpdateRole(member.id, 'admin')}>
                        Change to Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onRemoveMember(member.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove Member
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Team Members Yet</h3>
              <p className="text-muted-foreground">
                Invite team members to start collaborating
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamMembersList;
