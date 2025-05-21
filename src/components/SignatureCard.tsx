
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Signature } from '@/types/signature';
import { format } from 'date-fns';

interface SignatureCardProps {
  signature: Signature;
  onEdit: () => void;
  onDelete: () => void;
  onSetActive: () => void;
}

const SignatureCard: React.FC<SignatureCardProps> = ({ 
  signature, 
  onEdit, 
  onDelete,
  onSetActive 
}) => {
  return (
    <Card className={`signature-card overflow-hidden ${signature.active ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{signature.name}</CardTitle>
          {signature.active && (
            <Badge variant="default" className="bg-primary">Active</Badge>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Created {format(new Date(signature.createdAt), 'MMM d, yyyy')}
        </p>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md overflow-hidden max-h-24">
          <div className="overflow-hidden text-ellipsis" 
               dangerouslySetInnerHTML={{ __html: signature.content }} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
        {!signature.active && (
          <Button size="sm" onClick={onSetActive}>
            Set as Active
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default SignatureCard;
