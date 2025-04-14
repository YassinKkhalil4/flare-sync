
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { Button } from '@/components/ui/button';
import OverviewCard from '../components/Dashboard/OverviewCard';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Flame,
  PlusCircle,
  Calendar,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      
      <div className="flex-1 pl-[250px]">
        <div className="p-6 md:p-10">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}</h1>
            <p className="text-muted-foreground">
              Here's what's happening with your creator account today.
            </p>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <OverviewCard
              title="Total Followers"
              value="12,582"
              description="across all platforms"
              icon={<Users size={18} />}
              change={{ value: 12.2, positive: true }}
            />
            <OverviewCard
              title="Engagement Rate"
              value="4.6%"
              description="avg. last 30 days"
              icon={<Flame size={18} />}
              change={{ value: 0.8, positive: true }}
            />
            <OverviewCard
              title="Content Reach"
              value="45.8K"
              description="impressions this month"
              icon={<TrendingUp size={18} />}
              change={{ value: 5.1, positive: true }}
            />
            <OverviewCard
              title="Brand Deals"
              value="3"
              description="active campaigns"
              icon={<BarChart3 size={18} />}
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Upcoming Content</CardTitle>
                      <CardDescription>Your scheduled posts for the next 7 days</CardDescription>
                    </div>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Post
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Summer Collection Photoshoot",
                        date: "Today - 2:00 PM",
                        platform: "Instagram",
                        status: "Scheduled"
                      },
                      {
                        title: "Q&A Session: Content Creation Tips",
                        date: "Tomorrow - 6:30 PM",
                        platform: "YouTube",
                        status: "Draft"
                      },
                      {
                        title: "Skincare Routine Video",
                        date: "May 16 - 10:00 AM",
                        platform: "TikTok",
                        status: "Scheduled"
                      },
                      {
                        title: "Summer Fashion Haul",
                        date: "May 18 - 12:00 PM",
                        platform: "Instagram",
                        status: "Draft"
                      }
                    ].map((post, index) => (
                      <div key={index} className="flex items-center justify-between border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="bg-secondary h-10 w-10 rounded-full flex items-center justify-center text-secondary-foreground">
                            {post.platform === "Instagram" && "IG"}
                            {post.platform === "YouTube" && "YT"}
                            {post.platform === "TikTok" && "TT"}
                          </div>
                          <div>
                            <h4 className="font-medium">{post.title}</h4>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {post.date}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            post.status === "Scheduled" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {post.status}
                          </span>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Content</CardTitle>
                  <CardDescription>Your highest engagement posts this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Spring Makeup Tutorial",
                        date: "May 2, 2025",
                        platform: "Instagram",
                        engagement: "12.8K",
                        image: "https://via.placeholder.com/70"
                      },
                      {
                        title: "Beach Day Essentials",
                        date: "May 8, 2025",
                        platform: "TikTok",
                        engagement: "45.3K",
                        image: "https://via.placeholder.com/70"
                      },
                      {
                        title: "Home Office Setup Tour",
                        date: "May 10, 2025",
                        platform: "YouTube",
                        engagement: "8.7K",
                        image: "https://via.placeholder.com/70"
                      }
                    ].map((post, index) => (
                      <div key={index} className="flex items-center justify-between border-b last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="h-[70px] w-[70px] rounded-lg overflow-hidden bg-muted">
                            <img src={post.image} alt={post.title} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <h4 className="font-medium">{post.title}</h4>
                            <div className="text-xs text-muted-foreground">
                              {post.platform} · {post.date}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{post.engagement}</div>
                          <div className="text-xs text-muted-foreground">Engagements</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Brand Messages</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        name: "FashionTrends",
                        message: "Hi! We love your content and would like to...",
                        time: "2h ago",
                        avatar: "FT"
                      },
                      {
                        name: "EcoBeauty",
                        message: "Following up on our collaboration proposal...",
                        time: "Yesterday",
                        avatar: "EB"
                      },
                      {
                        name: "TechGadgets",
                        message: "Thanks for your interest in our new product line...",
                        time: "2d ago",
                        avatar: "TG"
                      }
                    ].map((message, index) => (
                      <div key={index} className="flex items-center gap-3 pb-3 border-b last:border-b-0 last:pb-0">
                        <Avatar>
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${message.avatar}`} />
                          <AvatarFallback>{message.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">{message.name}</h4>
                            <span className="text-xs text-muted-foreground">{message.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button className="w-full mt-4" variant="outline">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Open Messages
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Brand Deal Opportunities</CardTitle>
                  <CardDescription>Offers waiting for your response</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        brand: "Lifestyle Co.",
                        offer: "$1,500",
                        deadline: "May 20, 2025",
                        logo: "LC"
                      },
                      {
                        brand: "Beauty Essentials",
                        offer: "$800",
                        deadline: "May 25, 2025",
                        logo: "BE"
                      }
                    ].map((deal, index) => (
                      <div key={index} className="border border-border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${deal.logo}`} />
                            <AvatarFallback>{deal.logo}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{deal.brand}</h4>
                            <p className="text-xs text-muted-foreground">Due: {deal.deadline}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-bold">{deal.offer}</div>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline">Decline</Button>
                            <Button size="sm">Review</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
