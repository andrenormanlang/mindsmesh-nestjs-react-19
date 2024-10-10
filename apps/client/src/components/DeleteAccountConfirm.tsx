import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./shadcn/ui/dialog";
import { Button } from "./shadcn/ui/button";
import { Input } from "./shadcn/ui/input";
import { useToast } from "./shadcn/ui/use-toast"; 

const DeleteAccountModal = ({
  userEmail,
  onDeleteConfirm,
  isOpen,
  onClose,
}: {
  userEmail: string;
  onDeleteConfirm: () => void;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [emailInput, setEmailInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); 

  const handleConfirm = () => {
    if (emailInput === userEmail) {
      onDeleteConfirm();
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
        variant: "destructive",
        duration: 5000,
      });

      onClose();

      setTimeout(() => {
        window.location.reload();
      }, 3000); 
    } else {
      setError("Email does not match!");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Account Deletion</DialogTitle>
        </DialogHeader>
        <div>
          <p>
            Are you sure you want to delete your account? This action cannot be
            undone. Please type your email to confirm.
          </p>
          <Input
            type="email"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Enter your email"
            className="w-full mt-4"
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <DialogFooter className="flex justify-end space-x-4 mt-4">
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Confirm Deletion
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteAccountModal;
