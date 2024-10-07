import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../@/shadcn/ui/dialog";
import { Button } from "../../@/shadcn/ui/button";

const DeleteImage = ({
  isOpen,
  onClose,
  onDeleteConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onDeleteConfirm: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="items-center ">
          <DialogTitle>Confirm Image Deletion</DialogTitle>
        </DialogHeader>
        <div className="text-center">
          <p>Are you sure you want to delete this image?</p>
        </div>
        <div className="text-center mb-4">
          <p> This action cannot be undone.</p>
        </div>
        <DialogFooter className="text-center">
          <div className="inline-flex justify-center w-full space-x-2">
            <Button variant="destructive" onClick={onDeleteConfirm}>
              Confirm Deletion
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteImage;
