import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { AvatarImage, AvatarFallback } from "./ui/avatar";
import { Edit, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

export interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  billingFrequency: "monthly" | "one-time";
  serviceProvider: {
    name: string;
    logoUrl: string;
  };
  userRole?: "serviceProvider" | "networkOperator";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPreview?: (id: string) => void;
}

const ProductCard = ({
  id,
  name = "Product Name",
  description = "Product description goes here. This is a placeholder for the actual product description.",
  price = 99.99,
  type = "Internet",
  billingFrequency = "monthly",
  serviceProvider = {
    name: "Provider Name",
    logoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=provider",
  },
  userRole = "networkOperator",
  onEdit,
  onDelete,
  onPreview,
}: ProductCardProps) => {
  const isServiceProvider = userRole === "serviceProvider";
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);

  return (
    <Card className="w-full max-w-[350px] h-[220px] flex flex-col bg-white overflow-hidden">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <h3 className="font-semibold text-lg truncate">{name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {type}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {billingFrequency === "monthly" ? "Monthly" : "One-time"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={serviceProvider.logoUrl}
              alt={serviceProvider.name}
            />
            <AvatarFallback>
              {serviceProvider.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      </CardHeader>

      <CardContent className="px-4 py-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {description}
        </p>
        <p className="text-lg font-bold mt-2">{formattedPrice}</p>
      </CardContent>

      {isServiceProvider && (
        <CardFooter className="px-4 py-3 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(id)}
            className="h-8 px-3"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  product "{name}" and remove it from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete && onDelete(id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onPreview && onPreview(id)}
            className="h-8 px-3"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
