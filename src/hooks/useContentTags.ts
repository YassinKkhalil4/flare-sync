
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContentTag {
  id: string;
  name: string;
  created_at: string;
}

export const useContentTags = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['content-tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_tags')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching tags:', error);
        return [];
      }
      return data as ContentTag[];
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('content_tags')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      return data as ContentTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-tags'] });
      toast({
        title: 'Tag created',
        description: 'New content tag has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating tag',
        description: error.message || 'Failed to create tag',
        variant: 'destructive',
      });
    },
  });

  return {
    tags,
    isLoading,
    createTag: createTagMutation.mutate,
    isCreatingTag: createTagMutation.isPending,
  };
};
