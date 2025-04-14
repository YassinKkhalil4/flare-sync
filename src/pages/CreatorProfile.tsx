
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Instagram,
  Twitter,
  Youtube,
  Image as ImageIcon,
  Users,
  BarChart2,
  Heart,
  MessageSquare,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

const CreatorProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Alex Johnson',
    bio: 'Lifestyle creator focusing on sustainable living, fitness, and mindful consumption. I love to share authentic experiences with my audience.',
    location: 'Los Angeles, CA',
    website: 'alexjohnson.com',
    instagram: 'alex.sustainable',
    twitter: 'alexjsustain',
    youtube: 'AlexJohnsonLife',
    followers: 25800,
    engagement: 4.8,
    posts: 358,
    avatar: user?.avatar || 'https://api.dicebear.com/6.x/avataaars/svg?seed=Alex'
  });
  
  const [formData, setFormData] = useState({ ...profileData });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsLoading(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      setProfileData({
        ...formData,
        avatar: imagePreview || profileData.avatar
      });
      setIsEditing(false);
      setIsLoading(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setImagePreview(null);
    setIsEditing(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  // Mock recent posts data
  const recentPosts = [
    {
      id: '1',
      image: 'https://api.dicebear.com/6.x/shapes/svg?seed=post1',
      title: 'My sustainable morning routine',
      date: '2023-04-10',
      likes: 1250,
      comments: 78,
      shares: 32
    },
    {
      id: '2',
      image: 'https://api.dicebear.com/6.x/shapes/svg?seed=post2',
      title: 'Plant-based meal prep ideas',
      date: '2023-04-05',
      likes: 983,
      comments: 46,
      shares: 27
    },
    {
      id: '3',
      image: 'https://api.dicebear.com/6.x/shapes/svg?seed=post3',
      title: 'Zero-waste shopping tips',
      date: '2023-03-29',
      likes: 1580,
      comments: 92,
      shares: 54
    }
  ];

  return (
    <div className="container py-8 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <div className="h-24 w-24 rounded-full overflow-hidden">
                        <img 
                          src={imagePreview || profileData.avatar} 
                          alt={formData.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center cursor-pointer">
                        <ImageIcon className="h-4 w-4" />
                      </label>
                      <input 
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                    
                    <div className="space-y-3 w-full">
                      <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Bio</label>
                        <Textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows={4}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Website</label>
                        <Input
                          name="website"
                          value={formData.website}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Instagram</label>
                        <div className="flex">
                          <div className="bg-muted px-3 py-2 rounded-l-md border-y border-l border-input">@</div>
                          <Input
                            name="instagram"
                            value={formData.instagram}
                            onChange={handleInputChange}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Twitter</label>
                        <div className="flex">
                          <div className="bg-muted px-3 py-2 rounded-l-md border-y border-l border-input">@</div>
                          <Input
                            name="twitter"
                            value={formData.twitter}
                            onChange={handleInputChange}
                            className="rounded-l-none"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">YouTube</label>
                        <Input
                          name="youtube"
                          value={formData.youtube}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="h-24 w-24 rounded-full overflow-hidden mb-4">
                      <img 
                        src={profileData.avatar} 
                        alt={profileData.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h2 className="text-xl font-bold">{profileData.name}</h2>
                    <p className="text-muted-foreground">{profileData.location}</p>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold">{formatNumber(profileData.followers)}</p>
                      <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{profileData.engagement}%</p>
                      <p className="text-sm text-muted-foreground">Engagement</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{profileData.posts}</p>
                      <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">About</h3>
                    <p className="text-sm">{profileData.bio}</p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium mb-2">Connect</h3>
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-500" />
                      <span className="text-sm">@{profileData.instagram}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-400" />
                      <span className="text-sm">@{profileData.twitter}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      <span className="text-sm">{profileData.youtube}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <a href={`https://${profileData.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        {profileData.website}
                      </a>
                    </div>
                  </div>
                  
                  <Button className="w-full" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Content Tabs */}
        <div className="md:col-span-2">
          <Tabs defaultValue="content">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
              <TabsTrigger value="media-kit" className="flex-1">Media Kit</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentPosts.map(post => (
                  <Card key={post.id}>
                    <div className="aspect-video w-full overflow-hidden rounded-t-md">
                      <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-medium mb-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{new Date(post.date).toLocaleDateString()}</p>
                      
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" /> {post.likes}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" /> {post.comments}
                        </div>
                        <div className="flex items-center gap-1">
                          <Share2 className="h-4 w-4" /> {post.shares}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {/* Add More Content Card */}
                <Card className="flex flex-col items-center justify-center border-dashed p-6">
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-center">Add new content</p>
                  <Button variant="ghost" size="sm" className="mt-2">Upload Post</Button>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Growth</CardTitle>
                  <CardDescription>Your follower growth over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] flex items-end justify-between gap-2">
                    {Array.from({length: 14}, (_, i) => (
                      <div key={i} className="relative flex-1 bg-muted rounded-sm overflow-hidden">
                        <div 
                          className="absolute bottom-0 w-full bg-primary"
                          style={{height: `${20 + Math.random() * 80}%`}}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>Apr 1</span>
                    <span>Apr 7</span>
                    <span>Apr 14</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Engagement Rate</CardTitle>
                    <CardDescription>Average across all platforms</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">{profileData.engagement}%</div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Instagram</span>
                          <span className="text-sm font-medium">5.2%</span>
                        </div>
                        <Progress value={52} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Twitter</span>
                          <span className="text-sm font-medium">3.8%</span>
                        </div>
                        <Progress value={38} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">YouTube</span>
                          <span className="text-sm font-medium">4.5%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Audience Demographics</CardTitle>
                    <CardDescription>Who's viewing your content</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Age</h4>
                        <div className="grid grid-cols-5 gap-1 text-xs">
                          <div className="space-y-1">
                            <div className="h-16 bg-muted rounded-sm relative overflow-hidden">
                              <div className="absolute bottom-0 w-full bg-primary" style={{height: '30%'}}></div>
                            </div>
                            <p className="text-center text-muted-foreground">13-17</p>
                          </div>
                          <div className="space-y-1">
                            <div className="h-16 bg-muted rounded-sm relative overflow-hidden">
                              <div className="absolute bottom-0 w-full bg-primary" style={{height: '65%'}}></div>
                            </div>
                            <p className="text-center text-muted-foreground">18-24</p>
                          </div>
                          <div className="space-y-1">
                            <div className="h-16 bg-muted rounded-sm relative overflow-hidden">
                              <div className="absolute bottom-0 w-full bg-primary" style={{height: '85%'}}></div>
                            </div>
                            <p className="text-center text-muted-foreground">25-34</p>
                          </div>
                          <div className="space-y-1">
                            <div className="h-16 bg-muted rounded-sm relative overflow-hidden">
                              <div className="absolute bottom-0 w-full bg-primary" style={{height: '45%'}}></div>
                            </div>
                            <p className="text-center text-muted-foreground">35-44</p>
                          </div>
                          <div className="space-y-1">
                            <div className="h-16 bg-muted rounded-sm relative overflow-hidden">
                              <div className="absolute bottom-0 w-full bg-primary" style={{height: '20%'}}></div>
                            </div>
                            <p className="text-center text-muted-foreground">45+</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Gender</h4>
                        <div className="flex h-4 rounded-full overflow-hidden">
                          <div className="bg-blue-400 h-full" style={{width: '35%'}}></div>
                          <div className="bg-pink-400 h-full" style={{width: '65%'}}></div>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <span className="text-blue-400">Male (35%)</span>
                          <span className="text-pink-400">Female (65%)</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="media-kit">
              <Card>
                <CardHeader>
                  <CardTitle>Media Kit</CardTitle>
                  <CardDescription>Share your profile with brands</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Creator Profile PDF</p>
                        <p className="text-sm text-muted-foreground">Complete profile with analytics</p>
                      </div>
                    </div>
                    <Button>Download</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <BarChart2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Analytics Report</p>
                        <p className="text-sm text-muted-foreground">Detailed metrics for the last 30 days</p>
                      </div>
                    </div>
                    <Button>Download</Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <svg className="h-6 w-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 9H6M15 15V17M15 15H17M15 15V13M15 15H13M7 3V21M17 7V21M7 7H17M4 7H20M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Rate Card Template</p>
                        <p className="text-sm text-muted-foreground">Pro Feature</p>
                      </div>
                    </div>
                    <Button variant="outline">Upgrade to Pro</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfile;
