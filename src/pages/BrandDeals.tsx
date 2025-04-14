
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  DollarSign,
  MessageSquare, 
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock brand deals
const mockBrandDeals = [
  {
    id: '1',
    brand: {
      id: 'b1',
      name: 'Eco Cosmetics',
      logo: 'https://api.dicebear.com/6.x/initials/svg?seed=EC',
    },
    title: 'Sustainable Beauty Campaign',
    description: 'We would like you to create content featuring our new sustainable beauty line, highlighting our eco-friendly packaging and organic ingredients.',
    budget: 1500,
    deliverables: [
      '1 Instagram post',
      '2 Instagram stories',
      '1 TikTok video'
    ],
    deadline: '2023-05-15',
    status: 'pending'
  },
  {
    id: '2',
    brand: {
      id: 'b2',
      name: 'Fitness Buddy',
      logo: 'https://api.dicebear.com/6.x/initials/svg?seed=FB',
    },
    title: 'Workout App Promotion',
    description: 'Promote our fitness app in a workout routine video. Showcase how our app helps you track your fitness journey and achieve your goals.',
    budget: 1200,
    deliverables: [
      '1 YouTube video',
      '1 Instagram post'
    ],
    deadline: '2023-04-30',
    status: 'pending'
  },
  {
    id: '3',
    brand: {
      id: 'b3',
      name: 'Green Eats',
      logo: 'https://api.dicebear.com/6.x/initials/svg?seed=GE',
    },
    title: 'Plant-Based Meal Kit Review',
    description: 'We would love for you to try our plant-based meal kit and share your honest review with your audience, focusing on ease of preparation, taste, and sustainability.',
    budget: 800,
    deliverables: [
      '1 Instagram post',
      '1 Blog post'
    ],
    deadline: '2023-05-10',
    status: 'accepted'
  },
  {
    id: '4',
    brand: {
      id: 'b4',
      name: 'Tech Innovators',
      logo: 'https://api.dicebear.com/6.x/initials/svg?seed=TI',
    },
    title: 'Smart Home Device Feature',
    description: 'Feature our new smart home device in your content. Show how it integrates with your daily routine and improves your home environment.',
    budget: 2000,
    deliverables: [
      '1 YouTube video',
      '1 Instagram post',
      '2 Instagram stories'
    ],
    deadline: '2023-06-05',
    status: 'declined'
  },
  {
    id: '5',
    brand: {
      id: 'b5',
      name: 'Travel Light',
      logo: 'https://api.dicebear.com/6.x/initials/svg?seed=TL',
    },
    title: 'Sustainable Travel Gear Showcase',
    description: 'Create content showcasing our eco-friendly travel gear during your next trip or adventure. Highlight durability, sustainability, and practicality.',
    budget: 1800,
    deliverables: [
      '1 Instagram post',
      '3 Instagram stories',
      '1 Blog post with photos'
    ],
    deadline: '2023-05-25',
    status: 'completed'
  }
];

const BrandDeals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deals, setDeals] = useState(mockBrandDeals);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'declined' | 'completed'>('all');

  const handleAcceptDeal = (dealId: string) => {
    setDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealId ? {...deal, status: 'accepted'} : deal
      )
    );
    toast({
      title: "Deal accepted",
      description: "You've successfully accepted the brand deal.",
    });
    setSelectedDeal(null);
  };

  const handleDeclineDeal = (dealId: string) => {
    setDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealId ? {...deal, status: 'declined'} : deal
      )
    );
    toast({
      title: "Deal declined",
      description: "You've declined the brand deal.",
    });
    setSelectedDeal(null);
  };

  const handleCompleteDeal = (dealId: string) => {
    if (responseMessage.trim() === '') {
      toast({
        title: "Message required",
        description: "Please enter a completion message before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    setDeals(prevDeals => 
      prevDeals.map(deal => 
        deal.id === dealId ? {...deal, status: 'completed'} : deal
      )
    );
    toast({
      title: "Deal completed",
      description: "Your submission has been sent to the brand.",
    });
    setResponseMessage('');
    setSelectedDeal(null);
  };

  const filteredDeals = filterStatus === 'all' 
    ? deals 
    : deals.filter(deal => deal.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'accepted':
        return <Badge variant="secondary" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Declined</Badge>;
      case 'completed':
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Brand Deals</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onSelect={() => setFilterStatus('all')}>All Deals</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilterStatus('pending')}>Pending</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilterStatus('accepted')}>Accepted</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilterStatus('declined')}>Declined</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setFilterStatus('completed')}>Completed</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {filteredDeals.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No deals found</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                There are no brand deals matching the selected filter.
              </p>
              <Button onClick={() => setFilterStatus('all')}>View All Deals</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredDeals.map(deal => (
            <Card key={deal.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-[100px] bg-muted p-6 flex items-center justify-center">
                    <img src={deal.brand.logo} alt={deal.brand.name} className="h-12 w-12 rounded-md" />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-medium">{deal.title}</h3>
                          {getStatusBadge(deal.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">By {deal.brand.name}</p>
                        <p className="text-sm mb-4">{deal.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>Due: {new Date(deal.deadline).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>${deal.budget}</span>
                          </div>
                        </div>
                      </div>
                      
                      {deal.status === 'pending' && (
                        <div className="flex gap-3 mt-4 sm:mt-0">
                          <Button variant="outline" onClick={() => setSelectedDeal({...deal, action: 'decline'})}>
                            Decline
                          </Button>
                          <Button onClick={() => setSelectedDeal({...deal, action: 'accept'})}>
                            Accept Deal
                          </Button>
                        </div>
                      )}
                      
                      {deal.status === 'accepted' && (
                        <div className="flex gap-3 mt-4 sm:mt-0">
                          <Button onClick={() => setSelectedDeal({...deal, action: 'complete'})}>
                            Submit Work
                          </Button>
                        </div>
                      )}
                      
                      {(deal.status === 'declined' || deal.status === 'completed') && (
                        <Button variant="ghost" className="mt-4 sm:mt-0" size="sm">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Accept Deal Dialog */}
      <Dialog open={selectedDeal?.action === 'accept'} onOpenChange={() => selectedDeal?.action === 'accept' && setSelectedDeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Deal</DialogTitle>
            <DialogDescription>
              You're about to accept the deal from {selectedDeal?.brand.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">{selectedDeal?.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedDeal?.description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Deliverables:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground ml-2 space-y-1">
                {selectedDeal?.deliverables.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-lg">${selectedDeal?.budget}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Deadline</p>
                <p className="text-lg">{selectedDeal && new Date(selectedDeal.deadline).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDeal(null)}>Cancel</Button>
            <Button onClick={() => handleAcceptDeal(selectedDeal.id)}>Accept Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Decline Deal Dialog */}
      <Dialog open={selectedDeal?.action === 'decline'} onOpenChange={() => selectedDeal?.action === 'decline' && setSelectedDeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this deal from {selectedDeal?.brand.name}?
            </DialogDescription>
          </DialogHeader>
          
          <div>
            <h3 className="font-medium mb-1">{selectedDeal?.title}</h3>
            <p className="text-sm text-muted-foreground">{selectedDeal?.description}</p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDeal(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDeclineDeal(selectedDeal.id)}>Decline Deal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Complete Deal Dialog */}
      <Dialog open={selectedDeal?.action === 'complete'} onOpenChange={() => selectedDeal?.action === 'complete' && setSelectedDeal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Completed Work</DialogTitle>
            <DialogDescription>
              Share the links to your content and any additional notes
            </DialogDescription>
          </DialogHeader>
          
          <div>
            <h3 className="font-medium mb-1">{selectedDeal?.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">{selectedDeal?.description}</p>
            
            <Textarea 
              placeholder="Paste links to your content and any additional comments for the brand..."
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              rows={5}
              className="mb-2"
            />
            <p className="text-xs text-muted-foreground">
              Include all content links and any additional information the brand should know.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDeal(null)}>Cancel</Button>
            <Button onClick={() => handleCompleteDeal(selectedDeal.id)}>Submit Work</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BrandDeals;
