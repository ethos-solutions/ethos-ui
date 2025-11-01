import { Dailog as Dialog } from "@ethos-frontend/ui";

interface Props {
  open: boolean;
  handleClose: () => void;
  description?: string;
  type: "success" | "warning" | "delete";
  onClick: (e?: any) => void;
  cancelBtnText: string;
  confirmBtnText: string;
}

export default function WarningDialog({
  description,
  open,
  cancelBtnText,
  confirmBtnText,
  handleClose,
  onClick,
}: Props) {
  return (
    <Dialog
      open={open}
      onCancel={handleClose}
      onConfirm={onClick}
      cancelText={cancelBtnText}
      confirmText={confirmBtnText}
      title="Remove Organisation"
      size='md'
    >
      {description}
    </Dialog>
  );
}
