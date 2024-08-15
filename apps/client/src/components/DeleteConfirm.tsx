import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../@/components/ui/dialog";
import { Button } from "../../@/components/ui/button";
import { Input } from "../../@/components/ui/input";

const DeleteAccountModal = ({ userEmail, onDeleteConfirm }: { userId: string; userEmail: string; onDeleteConfirm: () => void }) => {
  const [emailInput, setEmailInput] = useState("");

  const handleConfirm = () => {
    if (emailInput === userEmail) {
      onDeleteConfirm();
    } else {
      alert("Email does not match!");
    }
  };

  return (
    <Dialog>
      <DialogHeader>
        <DialogTitle>Confirm Account Deletion</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <p>Are you sure you want to delete your account? This action cannot be undone. Please type your email to confirm.</p>
        <Input
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Enter your email"
          className="w-full mt-4"
        />
      </DialogContent>
      <DialogFooter>
        <Button variant="destructive" onClick={handleConfirm}>
          Confirm Deletion
        </Button>
        <Button variant="outline" onClick={() => console.log('Cancel')}>
          Cancel
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default DeleteAccountModal;
