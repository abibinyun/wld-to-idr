import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const CustomModal = ({ children, title, open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTrigger asChild>
        <button className="hidden" />
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-6 rounded-lg overflow-auto max-h-[100vh] bg-cyber-bg-secondary border-cyber-border-default shadow-2xl shadow-cyan-500/20">
        <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
        <div className="mt-4 max-h-[60vh] overflow-y-auto">{children}</div>
        <DialogClose asChild>
          <button className="mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-600">
            Tutup
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default CustomModal;
