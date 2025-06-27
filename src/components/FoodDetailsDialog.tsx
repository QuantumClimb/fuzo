
import { useState } from 'react';
import { FoodItem } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Clock, Share, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FoodDetailsDialogProps {
  food: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToggle?: (id: string) => void;
  isSaved?: boolean;
}

const FoodDetailsDialog = ({
  food,
  isOpen,
  onClose,
  onSaveToggle,
  isSaved = false,
}: FoodDetailsDialogProps) => {
  const [saved, setSaved] = useState(isSaved);
  const { toast } = useToast();
  
  if (!food) return null;
  
  const handleSaveToggle = () => {
    setSaved(!saved);
    if (onSaveToggle) {
      onSaveToggle(food.id);
    }
    
    toast({
      title: saved ? "Removed from plate" : "Added to plate",
      description: saved 
        ? "This item has been removed from your saved items" 
        : "This item has been added to your saved items",
      className: saved 
        ? "bg-gray-700 border-gray-600" 
        : "bg-green-600 border-green-500",
    });
  };

  // Format date to "X days ago" or similar
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths === 1) return '1 month ago';
    return `${diffMonths} months ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden rounded-lg">
        <div className="relative">
          <AspectRatio ratio={4/3}>
            <img
              src={food.image}
              alt={food.title}
              className="w-full h-full object-cover"
            />
          </AspectRatio>
          <div className="absolute top-4 left-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white/80 backdrop-blur-sm hover:bg-white" 
              onClick={onClose}
            >
              <ArrowLeft size={16} className="mr-1" />
              Back to Plate
            </Button>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className="bg-fuzo-yellow text-fuzo-dark font-medium">
              {food.tag}
            </Badge>
          </div>
        </div>
        
        <div className="p-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{food.title}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-3 space-y-4">
            <div className="flex items-center text-gray-600">
              <MapPin size={18} className="mr-2 text-fuzo-coral" />
              <span>{food.location}</span>
            </div>
            
            <div className="flex items-center text-gray-600">
              <Clock size={18} className="mr-2 text-fuzo-purple" />
              <span>Posted {formatDate(food.timestamp)}</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?name=${food.username}&background=random`}
                  alt={food.username}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium">Shared by @{food.username}</span>
            </div>
            
            {food.description && (
              <div className="py-2">
                <p className="text-gray-700">{food.description}</p>
              </div>
            )}

            {food.coordinates && (
              <div className="bg-gray-100 h-24 rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <MapPin size={24} className="text-fuzo-purple" />
                    <span className="text-xs mt-1">Map preview</span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button 
                variant="default" 
                className="flex-1 bg-fuzo-purple hover:bg-fuzo-purple/90"
                onClick={handleSaveToggle}
              >
                {saved ? (
                  <>
                    <Heart className="mr-2 h-4 w-4 fill-current" />
                    Saved to Plate
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-4 w-4" />
                    Add to Plate
                  </>
                )}
              </Button>
              
              <Button variant="outline" className="px-4">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FoodDetailsDialog;
