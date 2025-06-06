import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { useContentTags } from '@/hooks/useContentTags';

interface TagSelectorProps {
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ selectedTagIds, onTagsChange }) => {
  const { tags, isLoading, createTag, isCreatingTag } = useContentTags();
  const [newTagName, setNewTagName] = useState('');

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (newTagName.trim()) {
      createTag(newTagName.trim());
      setNewTagName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag();
    }
  };

  if (isLoading) {
    return <div>Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      <Label>Tags</Label>
      
      {/* Existing tags */}
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Badge
            key={tag.id}
            variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleTag(tag.id)}
          >
            {tag.name}
            {selectedTagIds.includes(tag.id) && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Badge>
        ))}
      </div>

      {/* Create new tag */}
      <div className="flex gap-2">
        <Input
          placeholder="Create new tag..."
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isCreatingTag}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleCreateTag}
          disabled={!newTagName.trim() || isCreatingTag}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Selected tags display */}
      {selectedTagIds.length > 0 && (
        <div>
          <Label className="text-sm text-muted-foreground">Selected tags:</Label>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedTagIds.map(tagId => {
              const tag = tags.find(t => t.id === tagId);
              return tag ? (
                <Badge key={tagId} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
